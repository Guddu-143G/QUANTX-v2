# Alpha Testing Strategy

## 1. Unit Testing
- **Factor Computations**: Ensure math is correct for winsorization, z-scoring, and ranking.
- **Neutralization**: Verify that sector-neutral z-scores sum to zero within each sector.
- **Diagnostics**: Verify IC, Sharpe, and Half-Life calculations against known deterministic datasets.

## 2. Integration Testing
- **Data Pipelines**: Verify that `market data` correctly triggers `factor` computation, which in turn updates the `composite` and generates a `signal`.
- **PiT Retrieval**: Verify that the `PointInTimeDataService` correctly masks data based on the `as_of` parameter.

## 3. Property-Based Testing
- **Weights Constraint**: Composite factor weights must *always* sum exactly to 100%.
- **Future Data Leakage**: Inject known future data into the database and assert that the PiT engine does not retrieve it for historical queries.
- **Idempotency**: Processing the same market event twice should not duplicate state.
