# Error Handling and Fail-Closed Policies

## 1. Fail Closed Principle
When the system cannot establish correctness, it must:
`DO NOT GUESS. DO NOT CONTINUE SILENTLY. DO NOT TRADE.`
Instead, the system will `BLOCK`, `LOG`, `ALERT`, and prompt for manual or automated `RECOVERY`.

## 2. Error Severity Levels
- **INFO**: Standard operational events.
- **WARNING**: Non-critical degradation (e.g., minor data delay).
- **ERROR**: Critical issue affecting a subsystem (e.g., factor data missing).
- **CRITICAL**: System-wide blockage (e.g., composite weights invalid).
- **FATAL**: Unrecoverable state requiring manual intervention.

## 3. Error Codes
Deterministic error codes must be used to trace failures:
- `ALPHA-DATA-001`: Stale market data.
- `ALPHA-DATA-002`: Missing fundamental data.
- `ALPHA-FACTOR-001`: Factor calculation blocked due to missing inputs.
- `ALPHA-COMPOSITE-001`: Invalid composite weights (sum != 100%).
- `ALPHA-SIGNAL-001`: Signal generation blocked due to critical checks.

## 4. No Silent Failures
Every failure must include:
`error_id`, `component`, `timestamp`, `severity`, `source`, `message`, `context`, and `recovery_state`.
