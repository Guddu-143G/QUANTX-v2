"""Local authentication primitives for QUANTX.

Production deployments should set SESSION_SECRET to a long random secret, use HTTPS,
and replace the local email-verification placeholder with a transactional mail provider.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import HTTPException, Request

DATABASE_PATH = Path(os.getenv("QUANTX_DATABASE_URL", Path(__file__).parent.parent / "quantx.db"))
SESSION_SECRET = os.getenv("SESSION_SECRET", "development-only-change-this-secret-before-production").encode()
SESSION_TTL_HOURS = int(os.getenv("SESSION_TTL_HOURS", "8"))


def now() -> datetime:
    return datetime.now(timezone.utc)
def get_db():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialise_database():
    with get_db() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE,
          full_name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL,
          last_login_at TEXT, is_active INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
          token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL,
          revoked_at TEXT, FOREIGN KEY(user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_id INTEGER PRIMARY KEY, title TEXT NOT NULL DEFAULT 'Portfolio Manager', desk TEXT NOT NULL DEFAULT 'Research Desk',
          preferences_json TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE,
          source TEXT NOT NULL, created_at TEXT NOT NULL
        );
        INSERT OR IGNORE INTO user_profiles (user_id, updated_at) SELECT id, datetime('now') FROM users;
        
        CREATE TABLE IF NOT EXISTS kite_instruments (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          instrument_token INTEGER NOT NULL UNIQUE, 
          exchange_token INTEGER, 
          tradingsymbol TEXT NOT NULL, 
          name TEXT, 
          last_price REAL, 
          expiry TEXT, 
          strike REAL, 
          tick_size REAL, 
          lot_size INTEGER, 
          instrument_type TEXT, 
          segment TEXT, 
          exchange TEXT NOT NULL, 
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_ki_token ON kite_instruments(instrument_token);
        CREATE INDEX IF NOT EXISTS idx_ki_ts ON kite_instruments(tradingsymbol);
        CREATE INDEX IF NOT EXISTS idx_ki_exchange ON kite_instruments(exchange);
        
        CREATE TABLE IF NOT EXISTS paper_orders (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            ticker TEXT NOT NULL,
            side TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            order_type TEXT NOT NULL,
            price REAL,
            status TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)


def validate_password(password: str):
    if len(password) < 12 or not any(c.islower() for c in password) or not any(c.isupper() for c in password) or not any(c.isdigit() for c in password):
        raise HTTPException(422, "Password must be at least 12 characters and include uppercase, lowercase, and a number.")


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    derived = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=32)
    return f"scrypt$16384$8$1${base64.b64encode(salt).decode()}${base64.b64encode(derived).decode()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, n, r, p, encoded_salt, encoded_hash = stored.split("$")
        if algorithm != "scrypt": return False
        actual = hashlib.scrypt(password.encode(), salt=base64.b64decode(encoded_salt), n=int(n), r=int(r), p=int(p), dklen=32)
        return hmac.compare_digest(actual, base64.b64decode(encoded_hash))
    except (ValueError, TypeError):
        return False


def public_user(row) -> dict:
    return {"id": row["id"], "email": row["email"], "full_name": row["full_name"], "created_at": row["created_at"]}


def create_user(email: str, full_name: str, password: str) -> dict:
    email, full_name = email.strip().lower(), full_name.strip()
    if "@" not in email or len(email) > 254: raise HTTPException(422, "Enter a valid email address.")
    if len(full_name) < 2 or len(full_name) > 120: raise HTTPException(422, "Enter your full name (2–120 characters).")
    validate_password(password)
    try:
        with get_db() as db:
            cursor = db.execute("INSERT INTO users (email, full_name, password_hash, created_at) VALUES (?, ?, ?, ?)", (email, full_name, hash_password(password), now().isoformat()))
            db.execute("INSERT INTO user_profiles (user_id, updated_at) VALUES (?, ?)", (cursor.lastrowid, now().isoformat()))
            return public_user(db.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone())
    except sqlite3.IntegrityError as exc:
        raise HTTPException(409, "An account with this email already exists.") from exc


def email_available(email: str) -> bool:
    normalized = email.strip().lower()
    if "@" not in normalized or len(normalized) > 254:
        return False
    with get_db() as db:
        return db.execute("SELECT 1 FROM users WHERE email = ?", (normalized,)).fetchone() is None


def capture_lead(email: str, source: str) -> dict:
    email = email.strip().lower()
    if "@" not in email or len(email) > 254:
        raise HTTPException(422, "Please enter a valid email address.")
    try:
        with get_db() as db:
            db.execute("INSERT INTO leads (email, source, created_at) VALUES (?, ?, ?)", (email, source, now().isoformat()))
        return {"status": "success", "message": "You have been added to the waitlist."}
    except sqlite3.IntegrityError:
        # If they are already in the waitlist, pretend it succeeded so they don't get an error
        return {"status": "success", "message": "You are already on the waitlist."}


def authenticate(email: str, password: str) -> dict:
    with get_db() as db:
        row = db.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
        if not row or not row["is_active"] or not verify_password(password, row["password_hash"]):
            raise HTTPException(401, "Invalid email or password.")
        db.execute("UPDATE users SET last_login_at = ? WHERE id = ?", (now().isoformat(), row["id"]))
        return public_user(row)


def token_digest(token: str) -> str: return hmac.new(SESSION_SECRET, token.encode(), hashlib.sha256).hexdigest()

def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(48)
    with get_db() as db:
        db.execute("INSERT INTO sessions (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)", (user_id, token_digest(token), (now() + timedelta(hours=SESSION_TTL_HOURS)).isoformat(), now().isoformat()))
    return token


def current_user(request: Request) -> dict:
    token = request.cookies.get("quantx_session")
    if not token: raise HTTPException(401, "Sign in required.")
    with get_db() as db:
        row = db.execute("""SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ? AND sessions.revoked_at IS NULL AND sessions.expires_at > ? AND users.is_active = 1""", (token_digest(token), now().isoformat())).fetchone()
    if not row: raise HTTPException(401, "Session expired. Please sign in again.")
    return public_user(row)


def revoke_session(token: str | None):
    if token:
        with get_db() as db: db.execute("UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL", (now().isoformat(), token_digest(token)))

def profile(user_id: int) -> dict:
    import json
    with get_db() as db:
        row = db.execute("SELECT users.email, users.full_name, user_profiles.title, user_profiles.desk, user_profiles.preferences_json FROM users JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id = ?", (user_id,)).fetchone()
    return {"email": row["email"], "full_name": row["full_name"], "title": row["title"], "desk": row["desk"], "preferences": json.loads(row["preferences_json"])}

def update_profile(user_id: int, full_name: str, title: str, desk: str, preferences: dict) -> dict:
    import json
    if not 2 <= len(full_name.strip()) <= 120: raise HTTPException(422, "Full name must be 2–120 characters.")
    with get_db() as db:
        db.execute("UPDATE users SET full_name = ? WHERE id = ?", (full_name.strip(), user_id))
        db.execute("UPDATE user_profiles SET title = ?, desk = ?, preferences_json = ?, updated_at = ? WHERE user_id = ?", (title.strip(), desk.strip(), json.dumps(preferences), now().isoformat(), user_id))
    return profile(user_id)
