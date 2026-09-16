# FreightAI — Engineering Handoff Context

**PROJECT STATUS:** Active SIH 2026 MVP Development  
**CURRENT FEATURE SET:** Authenticated dashboard + Vessel Recommendation + Port Compatibility + Trade Lane Intelligence + Freight & Market Intelligence + BDI Forecasting  
**LATEST COMPLETED PHASE:** Phase 5 — Freight Forecasting / BDI Market Outlook  
**CURRENT NEXT PRIORITY:** Continue with risk / idle-time intelligence and then combine the existing explainable signals into a higher-level chartering decision layer.

---

## 1. Project overview

FreightAI is a Smart India Hackathon (SIH) 2026 MVP for maritime bulk-cargo chartering decision support focused on cargo moving to/from India's East Coast ports. The product is intended to help a logistics/chartering user evaluate:

1. cargo quantity requirements,
2. vessel capacity suitability,
3. port dimensional compatibility,
4. trade-lane intelligence,
5. illustrative freight-market conditions, and
6. a market-wide dry-bulk freight outlook based on the Baltic Dry Index (BDI).

The system is a **decision-support prototype**, not an operational chartering, navigation, port-clearance, broker-quote, or commercial trading system.

All current operational/business data is demo or historical-model data. Nothing in the application should be presented as a live commercial quote, authoritative port limit, live vessel position, or guaranteed chartering recommendation.

---

## 2. Technology stack

### Frontend

- React 19
- Vite 7
- React Router
- Plain CSS
- `fetch()` for authenticated API calls
- Vite `/api` development proxy

### Backend

- Node.js
- Express 5
- Mongoose 8
- MongoDB
- JWT authentication
- HttpOnly authentication cookie
- bcrypt password hashing

### ML / data work

- Python-based offline research/training pipeline
- Historical BDI and vessel-index datasets
- pandas / scikit-learn-style modelling workflow
- Linear Regression selected as the current BDI forecasting model

The ML pipeline is currently an offline prototype. It is not a production inference service and does not yet consume live market data.

---

## 3. Current architecture

```text
React/Vite Frontend
        |
        |  /api proxy + credentials: include
        v
Express API
        |
        +--> Authentication
        +--> Vessel Recommendation
        +--> Port Compatibility
        +--> Trade Lane Intelligence
        +--> Freight Market Intelligence
        +--> Freight Forecasting
        |
        v
MongoDB / Mongoose

Offline ML pipeline
        |
        +--> Historical BDI data
        +--> Feature engineering
        +--> Train / validation / test
        +--> Walk-forward evaluation
        +--> Current BDI forecast
        |
        v
Demo FreightForecast record
        |
        v
Protected FreightAI forecast API
        |
        v
Frontend Freight Forecasting panel
```

The application deliberately keeps **route intelligence** and **market-wide forecasting** as separate concepts:

```text
Selected Voyage
   |
   +--> Route Intelligence
   |       Origin -> Destination
   |       Trade lane / route profile
   |
   +--> Port & Vessel Constraints
   |       Vessel capacity
   |       Destination draft / LOA / beam
   |
   +--> Market Intelligence
   |       Exact route + vessel demo snapshot
   |
   +--> Market-wide BDI Outlook
           Historical BDI model
           7 observations ahead
```

This separation is important: the current BDI model does **not** take origin or destination as model features and therefore must not be described as a route-specific freight-rate forecast.

---

## 4. Authentication and security

Authentication is implemented and integrated into the dashboard.

### Current authentication behaviour

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- JWT payload contains the user identifier.
- JWT expiry is one day.
- JWT is stored only in an HttpOnly cookie named `authToken`.
- `SameSite=Lax` is used.
- Secure cookies are enabled in production.
- Passwords are hashed with bcrypt cost 12.
- `requireAuth` verifies the token and rechecks that the user still exists.
- The frontend sends `credentials: 'include'` for authenticated API requests.
- Password hashes are not returned in user payloads.
- JWT values are not returned in JSON.
- Health remains public.
- Decision/intelligence APIs are protected.

Unauthenticated protected requests return `401` with the existing authentication error contract.

Do not weaken these controls when adding future features.

---

## 5. Core vessel recommendation

### Endpoint

`POST /api/vessels/recommend`

Example request:

```json
{
  "cargoQuantity": 80000
}
```

The service:

- validates that cargo quantity is finite and positive,
- reads vessel types from MongoDB,
- filters vessels whose maximum typical capacity can carry the cargo,
- ranks typical capacity-range matches before oversized matches,
- uses capacity surplus as a ranking factor,
- returns ranked vessel options and explanatory capacity fields.

The existing success contract must not be changed casually because the frontend and tests depend on it.

Current demo catalogue contains six vessel types, including Handysize, Supramax, Panamax and Capesize classes.

---

## 6. Port compatibility

### Endpoint

`POST /api/ports/compatibility`

Example request:

```json
{
  "originPort": "Paradip",
  "destinationPort": "Haldia",
  "vesselType": "Handysize"
}
```

Current compatibility evaluation compares vessel typical dimensions against destination-port maximum limits for:

- draft,
- LOA,
- beam.

The response includes:

- origin and destination details,
- vessel details,
- `compatible`,
- failed constraints,
- reason strings,
- `originPortConstraintsEvaluated: false`,
- demo-data disclaimer.

**Important:** origin-port constraints are still intentionally not evaluated by this API. Do not claim that both ends of a voyage have been operationally cleared.

---

## 7. Catalogue and demo data

The frontend uses protected backend catalogue endpoints for vessel and port selections rather than hard-coded lists.

The current seeded demo data includes:

- 6 demo vessel types,
- 24 demo ports,
- ports covering India, Australia, United States, Mozambique and Indonesia,
- 10 deterministic demo trade lanes,
- 3 deterministic freight-market snapshots,
- 1 deterministic freight-forecast record.

All values are illustrative.

The catalogue is MongoDB-backed and populated through idempotent seed operations.

---

## 8. Trade Lane Intelligence — Phase 3

Protected endpoints:

- `GET /api/trade-lanes`
- `GET /api/trade-lanes/lookup?originPort=...&destinationPort=...`

### Implemented behaviour

- Exact seeded lane returns detailed lane data.
- Known ports without an exact seeded lane can return a safe route profile.
- Fallback route profiles are explicitly labelled as estimated/demo data.
- No fabricated distance, transit time, freight rate, or risk value is introduced merely because two ports are known.
- Unknown ports return `404`.
- Same origin and destination returns `400`.
- Missing lane intelligence is non-blocking for vessel and port analysis.

Detailed lane data can contain:

- origin and destination references,
- distance in nautical miles,
- estimated transit days,
- preferred vessel types,
- cargo categories,
- data disclaimer.

The UI shows the selected route and distinguishes detailed lane data from estimated route profiles.

---

## 9. Freight & Market Intelligence — Phase 4

Protected endpoint:

`GET /api/freight-market/lookup?originPort=...&destinationPort=...&vesselType=...`

### Implemented behaviour

The market service resolves a deterministic snapshot using the selected trade lane and, when supplied, an exact vessel type.

Exact vessel matching is intentional: the service does **not** substitute a Panamax snapshot for a Supramax request or otherwise invent a nearby market value.

A snapshot can contain:

- indicative freight rate,
- freight-rate unit,
- market direction,
- market strength,
- demand signal,
- vessel supply signal,
- market status,
- commentary,
- data classification,
- disclaimer.

Current deterministic examples include:

- Paradip → Newcastle / Panamax — RISING / STRONG
- Paradip → Haldia / Handysize — STABLE / MODERATE
- Paradip → Tanjung Priok / Supramax — FALLING / WEAK

If a valid route has no exact market snapshot, the API returns a successful but unavailable result so the main voyage analysis can continue.

This market layer is **not** a live freight feed, broker quote, or ML forecast.

---

## 10. Historical freight-market research

Historical freight research was completed before the forecasting phase.

### Sources and data concepts researched

- Baltic Exchange dry-market data and index definitions.
- BDI historical data.
- BCI / Panamax historical data.
- BSI / Supramax historical data.
- BHSI / Handysize historical data.
- Public historical datasets including a CC BY 4.0 BDI/commodity-return dataset and other historical index sources.

Important market-definition finding:

- BDI is constructed from the major dry-bulk vessel segments.
- BCI, BPI and BSI are component indices used in the BDI framework.
- BHSI/Handysize is a separate benchmark and is not itself a direct BDI component in the same way.
- Route benchmark assessments must not be presented as direct FreightAI route freight rates.

### Uploaded historical files

Five historical Investing.com datasets were used in the ML research:

- BDI: 2010-01-04 → 2026-09-11
- BCI General: 2010-01-04 → 2019-12-30
- Panamax: 2012-07-04 → 2025-03-31
- Supramax: 2012-07-04 → 2025-03-27
- Handysize: 2012-07-04 → 2025-03-31

The common usable date intersection for the multi-index research was approximately:

**2012-07-04 → 2019-12-23, 1,853 rows.**

Non-positive/invalid BCI rows were treated as missing rather than silently converted into valid observations.

### Correlation findings from common-period returns

Approximate return correlations:

- BDI / Panamax: 0.551
- BDI / Supramax: 0.407
- BDI / Handysize: 0.349
- Panamax / Supramax: 0.439
- Supramax / Handysize: 0.748

These results were used as exploratory evidence only; correlation was not treated as proof of causal or route-specific forecasting power.

---

## 11. ML forecasting pipeline

The ML work is an offline historical-data forecasting pipeline.

### Feature engineering stages

The pipeline created:

1. BDI lag features:
   - lag 1
   - lag 2
   - lag 3
   - lag 7
   - lag 14
   - lag 30
2. Vessel-index lag features.
3. BDI rolling means and standard deviations over:
   - 7 observations,
   - 20 observations,
   - 60 observations.
4. Seven-observation-ahead target:
   - `BDI_target_7 = BDI.shift(-7)`
5. Advanced features including:
   - BDI absolute changes,
   - BDI percentage changes,
   - BDI versus rolling means,
   - volatility ratios,
   - vessel-index changes,
   - vessel ratios/spreads,
   - calendar sine/cosine features.

The horizon is **7 observations**, not guaranteed to mean exactly seven calendar days.

### Models evaluated

The multi-feature experiments included:

| Model | Test MAE | Test RMSE |
|---|---:|---:|
| Naive baseline | ~188.51 | ~265.94 |
| Linear Regression | ~179.71 | ~259.50 |
| Random Forest | ~201.11 | ~273.41 |
| Gradient Boosting | ~200.36 | ~260.98 |
| XGBoost | ~196.39 | ~257.75 |
| LightGBM | ~195.94 | ~257.78 |

Basic walk-forward evaluation showed that a simple linear model was more stable than the tree-based models in this dataset.

Advanced-feature Linear Regression achieved approximately:

- MAE: 174.78
- RMSE: 249.93

A regularized Ridge variant was also evaluated:

- MAE: 175.52
- RMSE: 251.39

### BDI-only model

A BDI-only dataset was then evaluated to reduce dependence on shorter historical component-index overlaps and to create a more stable, deployable prototype model.

Current BDI-only dataset:

- 3,914 usable rows
- 33 features
- feature period approximately 2010-03-26 → 2026-09-02
- latest source observation used for the current forecast: 2026-09-11
- current BDI: **3,507**

BDI-only Linear Regression results:

- validation MAE: ~221.36
- validation RMSE: ~297.64
- test MAE: ~172.99
- test RMSE: ~228.47

Walk-forward results:

- Naive MAE: ~220.90
- Naive RMSE: ~242.10
- BDI-only Linear MAE: ~202.93
- BDI-only Linear RMSE: ~230.59

This represents approximately:

- **8.13% walk-forward MAE improvement** over the naive baseline.
- **4.75% walk-forward RMSE improvement** over the naive baseline.

The BDI-only Linear Regression was selected as the current prototype forecasting model because it provided a simpler and more stable forecasting approach than the tested tree-based alternatives.

---

## 12. Current BDI forecast

The latest generated forecast is:

| Field | Current value |
|---|---|
| Forecast date | 2026-09-11 |
| Current BDI | 3,507 |
| Forecast BDI | **3,400.22** |
| Absolute change | **-106.78** |
| Percentage change | **-3.04%** |
| Direction | **FALLING** |
| Horizon | **7 observations ahead** |
| Model | **Linear Regression** |
| Features | **33** |
| Classification | **DEMO / HISTORICAL-DATA MODEL** |

Interpretation:

> The model indicates a modest expected softening in the market-wide dry-bulk BDI signal over the selected forecast horizon.

This is a **market-index outlook**, not a route-specific USD/MT prediction.

The model should not be described as predicting:

- Paradip freight specifically,
- Haldia freight specifically,
- Australia → India freight specifically,
- a broker quote,
- a vessel fixture price,
- or a guaranteed commercial rate.

---

## 13. Freight Forecasting backend — Phase 5

A protected forecast API was added to expose the latest generated model result to the application.

### Backend files

- `backend/src/models/FreightForecast.js`
- `backend/src/data/demoFreightForecasts.js`
- `backend/src/services/freightForecastService.js`
- `backend/src/controllers/freightForecastController.js`
- `backend/src/routes/freightForecastRoutes.js`

### Endpoint

`GET /api/freight-forecast/current`

The route is mounted behind `requireAuth`.

### Response concept

When available, the API returns:

- forecast date,
- current BDI,
- forecast BDI,
- forecast horizon,
- absolute change,
- percentage change,
- direction,
- model name,
- feature count,
- data classification,
- data disclaimer.

When no forecast exists, the service returns a safe unavailable response rather than blocking the voyage workflow.

### Demo seed

The demo forecast is idempotently seeded by the main seed script.

The seed output now includes:

```text
Seeded 6 demo vessel types, 24 demo placeholder ports, 10 demo trade lanes, 3 demo market snapshots, and 1 demo freight forecasts.
```

---

## 14. Frontend dashboard — current state

The dashboard currently provides:

### Input panel

- Cargo quantity
- Origin port
- Destination port
- Vessel type for port assessment
- Authenticated catalogue loading/error handling

Port selections are grouped by country and include international demo ports, including Australia, United States, Mozambique and Indonesia, in addition to Indian ports.

### Trade Lane Intelligence

The dashboard resolves the selected origin/destination pair automatically and displays:

- exact lane details when available,
- estimated route profile when only known ports are available,
- unavailable/error states without blocking core analysis.

### Decision Outcome

After `Analyze Voyage`:

- vessel recommendations are displayed,
- destination compatibility is displayed,
- failed dimensional constraints are shown,
- explanatory reasons and demo disclaimers are shown.

### Freight Forecasting / BDI Market Outlook

The dashboard now displays the current BDI forecast after the core analysis.

The forecast request is deliberately **non-blocking**. If forecast data is unavailable, the core vessel/port assessment can still render.

The forecast panel presents:

- selected voyage context,
- current BDI,
- forecast BDI,
- expected percentage change,
- absolute change,
- forecast horizon,
- model,
- feature count,
- data classification,
- disclaimer.

The route-aware presentation was added because users initially interpreted the same BDI forecast appearing for different routes as a bug.

### Important route-aware presentation decision

Selecting different ports should change the **route context shown in the forecast panel**, but it should **not change the BDI forecast number**.

For example:

```text
Australia -> Paradip
Market-wide BDI outlook
3507 -> 3400.22
-3.04% FALLING
```

and:

```text
Mozambique -> Haldia
Market-wide BDI outlook
3507 -> 3400.22
-3.04% FALLING
```

can both be correct because the current model is global/market-wide and has no route feature.

Do **not** artificially alter the forecast for each route. That would create fabricated route-specific ML output.

---

## 15. Current decision-support interpretation

FreightAI now has several distinct intelligence layers:

| Layer | Scope | Current status |
|---|---|---|
| Vessel Recommendation | Cargo quantity / vessel capacity | Implemented |
| Port Compatibility | Selected ports + vessel dimensions | Implemented; destination constraints only |
| Trade Lane Intelligence | Origin → destination | Implemented |
| Freight Market Snapshot | Route + vessel | Implemented with deterministic demo data |
| BDI Forecast | Market-wide dry bulk | Implemented with historical-data Linear Regression |
| Risk / Idle Time | Voyage risk / waiting exposure | Future |
| Final Charter Decision | Book / Wait / Multi-Voyage | Future |

The intended future architecture is to combine these signals into an explainable decision layer rather than allowing any single model to dictate a charter decision.

---

## 16. Data safety and model limitations

The following statements must remain visible in product/UI/documentation:

- Demo catalogue data is illustrative.
- Freight-market snapshots are illustrative.
- BDI forecasting is based on historical data.
- BDI forecasting is not a live freight-rate prediction.
- BDI forecasting is not a commercial market quote.
- Route-specific freight forecasting requires route-specific historical rate data.
- Port compatibility currently checks only destination draft, LOA and beam.
- Origin constraints are not evaluated.
- Berth, tide, terminal, weather, seasonal, cargo, clearance and operational constraints are not yet comprehensively modelled.
- No live vessel position or live fixture data is integrated.
- No production-grade automated model retraining pipeline exists.

Never silently turn demo/estimated values into authoritative claims.

---

## 17. Current API endpoints

### Public

`GET /api/health`

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Protected catalogue / decision APIs

- `GET /api/ports`
- `GET /api/vessels`
- `POST /api/vessels/recommend`
- `POST /api/ports/compatibility`

### Protected intelligence APIs

- `GET /api/trade-lanes`
- `GET /api/trade-lanes/lookup`
- `GET /api/freight-market/lookup`
- `GET /api/freight-forecast/current`

All protected endpoints require the authenticated HttpOnly cookie.

---

## 18. Environment variables

Copy `backend/.env.example` to `backend/.env`; never commit `.env`.

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | Express port, default 5000 |
| `NODE_ENV` | No | Development/production behaviour |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret, minimum 32 characters |
| `VITE_API_BASE_URL` | No | Optional frontend API origin; leave empty for local proxy |

---

## 19. Install and run locally

### Backend

```powershell
cd backend
copy .env.example .env
# Set MONGODB_URI and a unique JWT_SECRET in .env
npm install
npm run seed
npm run dev
```

Backend normally runs on:

```text
http://localhost:5000
```

### Frontend

In another terminal:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend normally runs on:

```text
http://localhost:5173
```

The Vite proxy routes `/api` requests to the local backend.

---

## 20. Testing and verification status

### Previously verified

The backend/auth foundation was manually exercised successfully, including:

- signup,
- duplicate signup,
- invalid signup,
- incorrect-password login,
- nonexistent-email login,
- authenticated `/me`,
- authenticated vessel recommendation,
- Paradip → Haldia Handysize compatibility,
- logout,
- post-logout authentication boundary,
- bcrypt password verification,
- absence of plaintext password storage,
- safe user responses.

Frontend production build was previously verified successfully against the working dashboard state.

### Automated tests

`backend/test/api.integration.test.js` contains integration coverage for authentication and decision/intelligence API behaviour, including Phase 4 scenarios.

Frontend tests include:

- `frontend/src/App.test.jsx`
- `frontend/src/AuthPage.test.jsx`
- `frontend/src/test/setup.js`

The latest Phase 5 frontend changes should be re-run through the local test/build commands before claiming a final release-ready verification.

Recommended commands:

```powershell
cd backend
npm test

cd ../frontend
npm test
npm run build
```

Do not claim a test/build passed unless it was actually run.

---

## 21. Repository layout

| Path | Role |
|---|---|
| `frontend/` | React/Vite application |
| `frontend/src/App.jsx` | Main authenticated dashboard |
| `frontend/src/AuthPage.jsx` | Login/signup UI |
| `frontend/src/RootApp.jsx` | Authentication/session routing shell |
| `frontend/src/index.css` | Dashboard/auth styling |
| `frontend/src/App.test.jsx` | Dashboard tests |
| `frontend/src/AuthPage.test.jsx` | Auth UI tests |
| `backend/` | Express/Mongoose API |
| `backend/src/models/` | MongoDB/Mongoose models |
| `backend/src/services/` | Business and intelligence services |
| `backend/src/controllers/` | HTTP controllers |
| `backend/src/routes/` | Express route definitions |
| `backend/src/data/` | Deterministic demo datasets |
| `backend/src/scripts/seedDemoData.js` | Main demo seed |
| `backend/test/` | Backend integration tests |
| `data/` | Reserved location for governed datasets |
| `ml/` | Offline forecasting/training pipeline |
| `Architecture.md` | Architecture reference |
| `DECISIONS.md` | Decision log |
| `TODO.md` | Remaining work |
| `PHASE4_IMPLEMENTATION.md` | Phase 4 implementation notes |
| `PROJECT_CONTEXT.md` | This authoritative handoff document |

---

## 22. Completed development phases

### Foundation

- Express + MongoDB backend
- React/Vite frontend
- Vessel catalogue
- Vessel recommendation API
- Basic health endpoint

### Authentication / dashboard

- User model
- bcrypt password hashing
- JWT authentication
- HttpOnly cookie session
- Protected API middleware
- Login/signup/logout/session flow
- Authenticated dashboard

### Phase 2 — Core decision workflow

- Protected catalogue endpoints
- Frontend cargo/route/vessel inputs
- Vessel recommendation UI
- Port compatibility UI
- Automated regression/integration coverage
- Build/test workflow established

### Phase 3 — Trade Lane Intelligence

- TradeLane model
- Deterministic demo lanes
- Protected lane APIs
- Exact lane resolution
- Safe estimated fallback route profile
- Route-aware dashboard panel

### Phase 4 — Freight & Market Intelligence

- FreightMarketSnapshot model
- Deterministic market snapshots
- Protected market lookup API
- Exact route/vessel matching
- Non-blocking unavailable state
- Market intelligence dashboard panel

### Phase 5 — Freight Forecasting

- Historical BDI research
- Multi-index exploratory analysis
- Lag/rolling/advanced feature engineering
- Multiple model comparison
- Walk-forward evaluation
- BDI-only Linear Regression selection
- Current BDI forecast generation
- FreightForecast MongoDB model
- Forecast seed data
- Protected forecast API
- Forecast dashboard integration
- Route-aware forecast presentation
- Explicit distinction between market-wide BDI outlook and route-specific freight intelligence

---

## 23. Remaining work / next priorities

### Immediate next phase

1. Add risk and idle-time intelligence.
2. Preserve the non-blocking behaviour of individual intelligence panels.
3. Keep each signal explainable and labelled by data quality/classification.
4. Avoid fabricating route-specific or live values when data is unavailable.

### Future intelligence

- Route-specific freight-rate forecasting using genuine route-level historical rates.
- Vessel availability / supply modelling.
- Port congestion.
- Berth and terminal constraints.
- Tide/weather/seasonal constraints where governed data is available.
- Waiting/idle-time estimation.
- Voyage risk scoring.
- More robust backtesting and model monitoring.

### Final decision layer

Eventually combine:

```text
Cargo requirement
      +
Vessel suitability
      +
Port compatibility
      +
Trade lane
      +
Freight market
      +
BDI outlook
      +
Risk / idle time
      +
Other governed signals
      |
      v
Explainable Chartering Decision Support
      |
      +--> Book Now
      +--> Wait
      +--> Multi-Voyage Contract
```

The final decision engine must remain explainable and should show which signals influenced the result. It must not present an opaque ML score as an authoritative commercial decision.

---

## 24. Important engineering decisions

1. **Do not rewrite existing decision engines.** Adjacent intelligence should be added around the existing vessel and compatibility contracts.
2. **Do not fabricate data.** If an exact market/route/forecast input is unavailable, show an explicit unavailable state or safe estimated profile.
3. **BDI forecast is market-wide.** Route selection changes presentation/context, not the BDI model output.
4. **Do not artificially perturb BDI predictions by route.** That would be misleading because the current model has no route feature.
5. **Route-specific forecasting is a future model problem.** It requires route-specific historical freight-rate data and a separate modelling/evaluation strategy.
6. **Keep demo disclaimers visible.** Demo and historical-model values are not operational inputs.
7. **Keep authenticated API calls credentialed.** Use `credentials: 'include'` and the existing HttpOnly cookie architecture.
8. **Keep health public.** It is used for service checks.
9. **Preserve successful authenticated API contracts.** Any breaking change requires an explicit migration decision.
10. **Use deterministic seed data for the MVP.** This makes demos and tests repeatable.
11. **Keep model outputs explainable.** Current forecast metadata exposes model, features, horizon, direction and disclaimer.
12. **Do not claim live intelligence.** No live freight market, live vessel feed, live port clearance, or live weather integration exists yet.

---

## 25. Instructions for future AI agents

1. Read this file before modifying the project.
2. Inspect the actual current implementation before coding; do not assume older planning documents are current.
3. Treat `PROJECT_CONTEXT.md` as the current handoff reference, but verify implementation details in source files.
4. Preserve all demo/estimated/historical-model disclaimers.
5. Never expose `passwordHash`.
6. Never return JWT values in JSON.
7. Never move the auth token to localStorage.
8. Do not weaken `JWT_SECRET` validation.
9. Preserve the Vite `/api` proxy and `credentials: 'include'` for authenticated frontend requests.
10. Keep protected APIs behind `requireAuth`.
11. Keep forecast failures non-blocking to the core vessel/port assessment.
12. Do not convert the market-wide BDI forecast into a fake route-specific prediction.
13. Do not change forecast numbers based on selected ports unless and until a genuine route-aware model is trained and validated.
14. Do not describe the BDI forecast as a USD/MT route rate.
15. Do not rewrite vessel recommendation or port compatibility logic when adding adjacent features.
16. Preserve existing successful request/response contracts unless a migration is explicitly planned.
17. Run tests/build locally before claiming verification.
18. Never commit `.env`, credentials, API keys, passwords, JWT secrets, or other sensitive configuration.
19. When adding ML, document the dataset, feature definition, target, horizon, baseline, evaluation method, limitations, and data provenance.
20. Prefer explainable, deterministic, auditable decision-support behaviour over impressive but unsupported AI claims.

---

## 26. Current one-paragraph handoff

**FreightAI is currently a functional SIH 2026 decision-support MVP with authenticated React/Vite + Express/MongoDB architecture. It supports protected vessel recommendation, destination port compatibility, trade-lane intelligence, deterministic route/vessel freight-market snapshots, and a protected market-wide BDI forecast generated from an offline historical-data Linear Regression model. The current forecast uses 33 BDI-derived features, predicts 7 observations ahead, and most recently projects BDI 3,507 → 3,400.22 (-3.04%, FALLING) from the 2026-09-11 observation. The frontend now shows the selected route alongside this market-wide forecast so users understand why the same BDI forecast can appear for different voyages. Do not artificially vary the forecast by route. The next planned feature is risk/idle-time intelligence, followed later by an explainable multi-signal chartering decision layer.**
