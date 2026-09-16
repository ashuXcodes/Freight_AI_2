# FreightAI TODO

## Continuation point

The previous development stopped after implementing and documenting the backend port-compatibility feature. The immediate state to resolve before adding new product functionality is the incomplete frontend source: `frontend/src/App.jsx` and `frontend/src/index.css` are deleted but remain imports of `frontend/src/main.jsx`. Confirm whether those deletions were intentional; restore the committed health-check UI or replace it with the approved next UI before running a frontend build.

## Next work, in dependency order

### 1. Stabilize the current foundation

- [ ] Resolve the two deleted frontend source files without overwriting an intentional user change.
- [ ] Verify a clean frontend production build after that decision.
- [ ] Start MongoDB, run the idempotent seed, and manually exercise health, recommendation, and compatibility endpoints.
- [ ] Add automated unit tests for ranking, dimensional compatibility, request validation, and missing catalogue records.
- [ ] Add integration tests using an isolated MongoDB test database.

### 2. Complete the current decision workflow

- [ ] Design and implement a frontend form for cargo quantity and show ranked vessel recommendations.
- [ ] Add a frontend origin/destination/vessel selection flow and render compatibility results, failed constraints, and demo-data warnings.
- [ ] Reuse a single source of truth for the vessel and port options rather than duplicating catalogue names in the UI.
- [ ] Define user-facing empty-state behaviour when no vessel can carry the requested cargo.
- [ ] Decide whether to expose read-only catalogue endpoints; neither exists today.

### 3. Make compatibility meaningful

- [ ] Replace all demo and placeholder values with governed, source-attributed data.
- [ ] Add origin-port constraints while retaining the existing request contract.
- [ ] Clarify operational rules not represented by draft, LOA, and beam alone (berth-specific limits, tide, cargo, terminal, seasonal restrictions, and clearance requirements).
- [ ] Define a data refresh and verification process before any real-world use.

### 4. Build the intended intelligence layer

- [ ] Define the exact forecasting or optimisation questions before creating ML code in `ml/`.
- [ ] Collect versioned, legally usable datasets in `data/` or managed storage.
- [ ] Establish feature definitions, baselines, evaluation metrics, and human review criteria.
- [ ] Keep model outputs explainable and clearly separate advisory scores from operational approval.

### 5. Production readiness

- [ ] Add authentication and authorization only after defining users and permissions.
- [ ] Add observability, structured logging, rate limiting, security headers, and configuration validation appropriate to the deployment.
- [ ] Specify API versioning, deployment environments, CI, database backups, and secret management.

## Non-goals until requirements change

Do not represent demo recommendations as real chartering advice, infer real port capability from the placeholder values, or add ML merely because the project name includes AI.
