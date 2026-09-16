# FreightAI Decisions

This log records decisions visible in the repository as of the current inspection. It distinguishes implemented choices from open decisions so future work does not mistake a placeholder for a product commitment.

| Status | Decision | Evidence and consequence |
| --- | --- | --- |
| Implemented | FreightAI is a decision-support foundation for bulk-cargo vessel chartering at India's East Coast ports. | The README and initial UI establish this scope. The system is advisory, not an operational control system. |
| Implemented | Use a JavaScript full-stack foundation: React/Vite client, Express API, MongoDB/Mongoose persistence. | `frontend/` uses React 19/Vite 7; `backend/` uses Express 5, Mongoose 8, and dotenv. |
| Implemented | Keep the frontend and backend as separate local applications. | Vite proxies `/api` locally; `VITE_API_BASE_URL` supports a separately hosted client. |
| Implemented | Require MongoDB rather than serving catalogue data directly from source files. | Models and recommendation/compatibility services query MongoDB; seed scripts load the code-held data. |
| Implemented | Seed catalogues with idempotent upserts. | Each seeder uses `bulkWrite` with `updateOne` and `upsert`, allowing repeated runs without duplicate records. |
| Implemented | Use illustrative demo data only. | Vessel data is `DEMO_SAMPLE`; port data is `DEMO_PLACEHOLDER`; responses propagate disclaimers. This prevents a false claim of operational accuracy. |
| Implemented | Recommend vessels from cargo capacity before considering other factors. | The recommendation endpoint filters by maximum typical capacity and ranks typical range matches before oversized matches with lower surplus first. |
| Implemented | Evaluate only destination dimensional compatibility in the first port feature. | The API accepts origin and destination, but compares typical draft, LOA, and beam only to destination limits and returns `originPortConstraintsEvaluated: false`. |
| Implemented | Use exact, case-insensitive catalogue name matching. | Port and vessel lookup regular expressions are anchored and escape user input. |
| Implemented | Fail fast on missing backend database configuration. | `MONGODB_URI` is required during environment loading, so the API will not start in an unconfigured state. |
| Not implemented | Forecasting or machine learning. | `ml/` is empty except for `.gitkeep`; no model, training pipeline, inference service, or dataset exists. |
| Not implemented | Authentication and user-specific workflows. | No auth middleware, identity provider, user model, or saved analysis is present. |
| Not implemented | A user interface for either decision endpoint. | The last committed UI only checked API health. The corresponding source files are currently deleted in the working tree. |
| Open | Whether to restore or replace the deleted health-check UI. | This is the immediate continuation decision; do not silently restore it because the deletions are uncommitted user changes. |
| Open | The authoritative data sources, update cadence, provenance fields, and operational validation process. | Current data is explicitly unsuitable for real chartering or clearance decisions. |
| Open | The definition, data, metrics, and safety boundaries of the eventual AI capability. | The repository reserves an ML folder but does not yet define a valid ML problem. |

## Change-history checkpoint

The first visible commit (`d94a192`, 29 August 2026) created the application foundation and vessel recommendation feature. The latest commit (`79ea833`, 29 August 2026) added the port model, demo ports, seeders, compatibility route/controller/service, and README documentation. There are no later commits in the checked-out history. The only current working-tree changes before this documentation work are deletions of `frontend/src/App.jsx` and `frontend/src/index.css`.
