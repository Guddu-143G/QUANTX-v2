# Data Lineage and Provenance

## 1. Principle
Every metric displayed or utilized within the Alpha Lab must have a deterministic and traceable origin. The system must always be able to answer: *Where did this number come from?*

## 2. Requirements for Observations
Every data point in the Point-in-Time (PiT) data store must include:
- `instrument_id`: The asset being observed.
- `event_time`: The timestamp when the event actually occurred in the real world.
- `effective_time`: The exact timestamp when this information became known and tradable by market participants.
- `ingested_at`: The exact timestamp the system recorded the data.
- `source`: The provider of the data.
- `dataset_version`: The version of the schema or processing pipeline used to parse the data.

## 3. Lineage Tracking
When generating a factor score or composite signal, the following must be logged:
- Factor Version (e.g., Momentum v3.1).
- Universe Snapshot (e.g., NIFTY 200 snapshot 2026-08-23).
- Data Sources and Timestamps used.
- Normalization and Neutralization methodologies applied.
