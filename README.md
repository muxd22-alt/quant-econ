# quant-econ

Part of the muxd22-alt monorepo consolidation (50 repos -> 5).

Every member lives in `repos/<name>/` and stays self-contained.
Identical CI configs across the old repos were replaced by the single,
shared workflow set in `.github/workflows/`:

- **CI** — structure, oversized-file, secret and syntax checks on every push/PR
- **Daily Digest** — scheduled 06:00 UTC, publishes a per-member activity table
  to the `Daily Digest` issue and the job summary

## Members

| folder | language | files | size | merged (absorbed repos) |
|---|---|---:|---:|---|
| `AcomZ` | JavaScript | 206 | 35.7 MB | — |
| `BlockMesh` | JavaScript | 5 | 0.1 MB | — |
| `China` | JavaScript | 23 | 0.4 MB | — |
| `SectorShift` | Python | 17 | 1.0 MB | — |
| `TASI` | HTML | 8 | 0.1 MB | — |
| `TASI-Quant-Replicator` | TypeScript | 22 | 0.3 MB | — |
| `TASI-Quant-Replicator-Public` | Python | 9 | 0.1 MB | — |
| `UHI_SAUDI` | HTML | 9 | 0.1 MB | — |
| `UHI_tracker` | HTML | 5 | 0.0 MB | — |
| `daily_stock_analysis` | Python | 489 | 71.7 MB | — |
| `future_proofing` | Python | 14 | 0.6 MB | — |
| `post_labour_tracker` | HTML | 7 | 0.1 MB | `post-labour-tracker` |
| `radar_2` | Python | 10 | 0.0 MB | — |

See `SOURCE_MAP.md` for the old-repo -> new-path mapping, including files
kept under `repos/<x>/_variants/` (conflicting versions from absorbed repos).

## Dashboard

Live combined dashboard: **[https://muxd22-alt.github.io](https://muxd22-alt.github.io)** (aggregates this monorepo with the other dashboards-type monorepos).
