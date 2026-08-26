# QUANTX Security Architecture

This document describes the security, trust, and authorization boundaries for the QUANTX Real-Time Portfolio Intelligence Platform.

## 1. Regulatory Design Principle (SEBI Context)
The platform is designed primarily for the Indian securities market. It strictly acknowledges that:
- An API key does not grant unrestricted trading authority.
- Simulated execution does not equal real execution.
- Order placement success from a broker does not guarantee order execution at the exchange.
- Algorithmic and signal-driven execution exists behind a strict **Compliance Boundary**.

## 2. Broker Credential Security (Trust Architecture)

**Never expose broker access tokens to the browser.**

- **Architecture:** `Browser -> QUANTX -> Encrypted Credential Vault -> Broker API`
- Broker passwords are NEVER stored in the system. QUANTX utilizes authorized API connections (e.g., OAuth flow or secure token exchange with the broker).
- Access tokens are stored with encryption at rest.
- A dedicated secrets manager handles production credentials.
- Implement token rotation, expiry detection, and connection health monitoring.

## 3. User Authentication & Authorization

- **Current State:** Local auth with scrypt hashes and HTTP-only, `SameSite=Strict` cookies.
- **Target State:**
  - Support for OAuth2 / OIDC for enterprise SSO.
  - Mandatory Multi-Factor Authentication (MFA) for live-trading accounts.
  - Short-lived access tokens + secure refresh tokens.
  - Role-Based Access Control (RBAC).
  - Secure session and device management.

## 4. Fraud & Security Monitoring

QUANTX implements active monitoring to detect malicious behavior or compromised accounts.
- Detection of unusual logins or new devices.
- Burst rate limiting (e.g., rapid order burst).
- API misuse and credential anomaly detection.
- Requirement for step-up authentication (re-auth) for sensitive actions like enabling Live Trading Mode, altering Daily Loss Limits, or triggering the Kill Switch.

## 5. Audit Logging

Every critical action in the system is logged to an immutable, append-only data store.
- Logins, logouts, and broker connections.
- Strategy activation and risk-limit changes.
- Live-mode activation.
- Order creation, modification, and cancellation.
- Kill-switch activation and manual overrides.

## 6. Live Trading Mode Safety Gate

Live mode is disabled by default. It requires an explicit user opt-in through a "Safety Gate" which verifies:
- Broker connected and permissions verified.
- Risk profile, daily loss limits, and position limits are configured.
- Kill switch is configured.
- Paper-trading validation has been successfully completed.

*No black-box trading:* Every live order is logged with the `strategy_id`, `signal_id`, `risk_decision_id`, and `user_policy_version` to provide complete transparency.
