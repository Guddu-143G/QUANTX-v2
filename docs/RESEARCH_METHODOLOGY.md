# Research Methodology

## 1. No Look-Ahead Bias
Historical calculations must strictly use information available at the historical timestamp (`effective_time`). The system will strictly block access to future prices, fundamentals, sentiment, or revised macro data during backtests or factor diagnostics.

## 2. No Survivorship Bias
Backtests and historical research must evaluate strategies using the point-in-time universe. If an asset was delisted in 2021, it must be included in the 2020 simulation and properly handled upon delisting. Using today's NIFTY 200 constituents to backtest the last 5 years is strictly prohibited.

## 3. Version Immutability
Every factor definition, composite strategy, and backtest run must be versioned. Existing definitions cannot be modified in place. A new version must be created to ensure full reproducibility of past research runs.

## 4. Half-Life Estimation
Signal decay (half-life) must be empirically derived from a statistically significant sample size of historical observations. If the sample size is insufficient, the system must report `HALF-LIFE: UNAVAILABLE` rather than guess.

## 5. Return Calculation and IC
Information Coefficient (IC) is a measure of the correlation between a factor score and the *forward* return. IC must only be calculated once the corresponding forward return period has elapsed. A "Current IC" for a live factor score is a logical impossibility and must not be displayed.
