import os
import json
from kiteconnect import KiteConnect
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/kite", tags=["kite"])

TOKEN_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "kite_token.json")

def get_kite_client():
    api_key = os.getenv("KITE_API_KEY")
    api_secret = os.getenv("KITE_API_SECRET")
    if not api_key or not api_secret:
        raise HTTPException(status_code=500, detail="KITE_API_KEY and KITE_API_SECRET must be set")
    return KiteConnect(api_key=api_key)

def load_access_token():
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "r") as f:
            data = json.load(f)
            return data.get("access_token")
    return None

def save_access_token(token: str):
    os.makedirs(os.path.dirname(TOKEN_FILE), exist_ok=True)
    with open(TOKEN_FILE, "w") as f:
        json.dump({"access_token": token}, f)

def clear_access_token():
    if os.path.exists(TOKEN_FILE):
        os.remove(TOKEN_FILE)

class CallbackRequest(BaseModel):
    request_token: str

@router.get("/login")
def kite_login():
    kite = get_kite_client()
    return {"login_url": kite.login_url()}

@router.post("/callback")
def kite_callback(payload: CallbackRequest):
    kite = get_kite_client()
    try:
        data = kite.generate_session(payload.request_token, api_secret=os.getenv("KITE_API_SECRET"))
        access_token = data["access_token"]
        save_access_token(access_token)
        return {"status": "success", "message": "Authenticated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status")
def kite_status():
    token = load_access_token()
    if token:
        # Check if valid by fetching profile
        kite = get_kite_client()
        kite.set_access_token(token)
        try:
            profile = kite.profile()
            return {"status": "connected", "user": profile["user_name"]}
        except Exception:
            return {"status": "disconnected"}
    return {"status": "disconnected"}

@router.post("/disconnect")
def kite_disconnect():
    clear_access_token()
    return {"status": "disconnected"}
