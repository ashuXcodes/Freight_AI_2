# FreightAI — Engineering Handoff Context

**PROJECT STATUS: Active MVP Development**

**LAST COMPLETED FEATURE:** Authentication + FreightAI decision dashboard

**CURRENT NEXT PRIORITY:** Add read-only, authenticated catalogue endpoints so dashboard selectors use MongoDB rather than mirrored frontend demo lists; add automated tests alongside that work.

## 1. Project overview

FreightAI is a Smart India Hackathon (SIH) 2026 MVP for maritime bulk-cargo chartering decision support at India's East Coast ports. It combines a cargo-capacity vessel recommendation with a destination-port dimensional compatibility assessment. It is an advisory prototype, not an operational clearance, voyage-planning, or chartering system.

The product intentionally labels all vessel and port values as demo or placeholder data. Do not describe any result as real-world port clearance or chartering advice.

## 2. Product objective and vision

The immediate user journey is: an authenticated user supplies cargo tonnage, an origin, destination, and vessel for assessment; FreightAI recommends vessel classes that can carry the cargo and shows whether the selected vessel fits the destination's demo limits. The long-term vision is explainable, data-governed chartering intelligence—not unsupported “AI predictions.”

## 3. Current features

- React/Vite responsive chartering dashboard at `/dashboard`.
- Cargo, origin, destination, and vessel-assessment inputs.
- Parallel vessel recommendation and port compatibility requests.
- Executive summary, compatibility status/reasons/constraints, ranked recommendation cards, loading, validation, empty, invalid-response, and API-error states.
- Local account signup, login, persisted browser session, protected dashboard, user header, and logout.
- MongoDB-backed demo vessel and port catalogues with idempotent seed scripts.
- Public health endpoint.

## 4. Architecture

```text
React 19 + Vite + React Router
  BrowserRouter: /login, /signup, /dashboard
  HttpOnly auth cookie (sent through Vite /api proxy)
                 |
                 v
Express 5 API
  /api/auth      -> User/MongoDB + bcrypt + JWT verification
  /api/vessels   -> protected recommendation service
  /api/ports     -> protected compatibility service
                 |
                 v
MongoDB
  users, vesseltypes, ports
```

### Frontend architecture

The frontend is plain React and CSS—no component/UI framework. `frontend/src/main.jsx` mounts `RootApp` in `StrictMode`. `RootApp.jsx` uses React Router, restores a session with `GET /api/auth/me`, redirects unauthenticated users to `/login`, and supplies logout/user data to the dashboard.

| File | Purpose |
| --- | --- |
| `frontend/src/RootApp.jsx` | Routes, session restoration, protected dashboard gate, logout. |
| `frontend/src/AuthPage.jsx` | Shared login/signup form, client-side confirmation and minimum-password validation. |
| `frontend/src/App.jsx` | Named `Dashboard` component; existing voyage analysis workflow. |
| `frontend/src/index.css` | Dashboard and auth visual styling. |
| `frontend/vite.config.js` | Proxies `/api` to `http://localhost:5000` for local development. |

There are no backend catalogue read endpoints. Therefore `App.jsx` declares `demoPorts` and `demoVesselTypes` as clearly documented UI labels that mirror the backend seed source. Do not treat those as an independent source of truth; replace them after adding catalogue endpoints.

### Backend architecture

The backend uses Express routers, controllers, Mongoose models, and services. `backend/src/server.js` validates environment configuration, connects MongoDB, then listens. `backend/src/app.js` configures JSON body parsing, cookie parsing, public health, auth routes, protected decision routes, and final error handling.

| Area | Files |
| --- | --- |
| Configuration | `src/config/env.js`, `src/config/database.js` |
| Auth | `src/models/User.js`, `src/controllers/authController.js`, `src/routes/authRoutes.js`, `src/middleware/requireAuth.js` |
| Vessel decisions | `src/routes/vesselRoutes.js`, `src/controllers/vesselController.js`, `src/services/vesselRecommendationService.js`, `src/models/VesselType.js` |
| Port decisions | `src/routes/portRoutes.js`, `src/controllers/portCompatibilityController.js`, `src/services/portCompatibilityService.js`, `src/models/Port.js` |
| Demo data/seeding | `src/data/`, `src/scripts/` |

### Database architecture

Mongoose connects using `MONGODB_URI`.

- `users`: `name`, unique normalized lowercase `email`, and `passwordHash`; timestamps add `createdAt` and `updatedAt`. `passwordHash` has `select: false`, so normal responses and normal model lookups omit it.
- `vesseltypes`: unique vessel type, typical cargo min/max, draft/LOA/beam, classification, disclaimer, timestamps.
- `ports`: unique port name, country, maximum draft/LOA/beam, cargo handling rate, classification, disclaimer, timestamps.

## 5. Authentication architecture

Authentication is first-party JWT-cookie authentication suitable for this MVP:

- Passwords are bcryptjs hashes at 12 rounds; plaintext is never persisted or returned.
- On signup/login, the backend signs `{ userId }` with `JWT_SECRET`, expiry `1d`.
- The token is emitted only as the `authToken` `HttpOnly`, `SameSite=Lax` cookie, with `secure: true` in production.
- JavaScript cannot read the token. Frontend requests use `credentials: 'include'`.
- `requireAuth` verifies the signed cookie, confirms the referenced User still exists, then attaches that user to `request.user`.
- `POST /api/auth/logout` clears the cookie.
- `GET /api/auth/me` returns only safe user fields.

The health endpoint is public. The vessel and port decision endpoints now require authentication; their successful request/response contracts were not changed. Unauthenticated calls receive `401 { "error": "Authentication is required." }`.

## 6. API endpoints and formats

### Public

`GET /api/health`

Response `200`:

```json
{ "status": "ok", "service": "freight-ai-api", "timestamp": "2026-09-08T00:00:00.000Z" }
```

### Authentication

`POST /api/auth/signup`

Request:

```json
{ "name": "Asha Kumar", "email": "asha@example.com", "password": "at-least-8-characters" }
```

The name must be 2–100 trimmed characters, email must match the server’s basic email format, and password must have at least 8 characters. Frontend additionally verifies confirm-password before submitting.

Success `201`: sets auth cookie and returns:

```json
{ "user": { "id": "mongodb-id", "name": "Asha Kumar", "email": "asha@example.com", "createdAt": "ISO date" } }
```

Errors: `400` invalid input, `409` duplicate email, `500` unexpected failure.

`POST /api/auth/login`

Request:

```json
{ "email": "asha@example.com", "password": "at-least-8-characters" }
```

Success `200`: sets auth cookie and returns the same safe user payload. Errors: `400` malformed/missing credentials, `401` invalid password or nonexistent email (intentionally indistinguishable), `500` unexpected failure.

`POST /api/auth/logout`

Clears the auth cookie. Response `200`:

```json
{ "message": "Logged out successfully." }
```

`GET /api/auth/me`

Requires the cookie. Response `200` is the safe user payload above. Missing, invalid, expired, or deleted-user token returns `401`.

### Protected vessel recommendation

`POST /api/vessels/recommend`

Request:

```json
{ "cargoQuantity": 80000 }
```

`cargoQuantity` must be a finite positive number. Success `200` includes:

```json
{
  "cargoQuantity": 80000,
  "unit": "tonnes (demo assumption)",
  "dataClassification": "DEMO_SAMPLE",
  "dataDisclaimer": "...",
  "recommendationCount": 3,
  "recommendations": [
    {
      "rank": 1,
      "vesselType": "Panamax",
      "minimumTypicalCargoCapacity": 60000,
      "maximumTypicalCargoCapacity": 80000,
      "typicalDraft": 13,
      "typicalLOA": 225,
      "typicalBeam": 32.5,
      "capacitySurplus": 0,
      "suitability": "TYPICAL_CAPACITY_MATCH",
      "dataClassification": "DEMO_SAMPLE",
      "dataDisclaimer": "..."
    }
  ]
}
```

The service includes types whose maximum typical capacity can carry the cargo. Typical-range matches rank before oversized matches; then lower surplus ranks first. Invalid input returns `400`; no qualifying type is a successful empty list.

### Protected port compatibility

`POST /api/ports/compatibility`

Request:

```json
{ "originPort": "Paradip", "destinationPort": "Haldia", "vesselType": "Handysize" }
```

All values must be nonempty strings. Lookups are exact case-insensitive matches. Success `200` returns origin/destination details, vessel dimensions, `compatible`, failed constraints, reason strings, and the demo disclaimer. Example result for the request above has `compatible: false`, a `maximumDraft` failure, and `originPortConstraintsEvaluated: false`.

The service compares only destination maximum draft, LOA, and beam against the vessel’s typical dimensions. It deliberately does not assess origin constraints. Invalid input returns `400`, a missing catalogue resource returns `404`, and unauthenticated access returns `401`.

## 7. Environment variables

Copy `backend/.env.example` to `backend/.env`; do not commit `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No (defaults to 5000) | Express listen port. |
| `NODE_ENV` | No (defaults to development) | Enables secure cookies when `production`. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Unique random signing secret, minimum 32 characters. |
| `VITE_API_BASE_URL` | No | Frontend API origin; leave empty for local Vite proxy. |

## 8. Install and run

Prerequisites: Node.js 20+, npm 10+, MongoDB 7+.

```powershell
cd backend
copy .env.example .env
# Set a unique JWT_SECRET and valid MONGODB_URI in .env
npm install
npm run seed
npm run dev
```

In a second terminal:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The root route redirects to `/login`; create an account, then use `/dashboard`.

## 9. Demo seed data

`npm run seed` upserts six demo vessel types: Handysize, Handymax, Supramax, Panamax, Kamsarmax, and Capesize. It upserts seven ports: Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Sagar-Sandheads, and Haldia. Values are deliberately illustrative. `npm run seed:vessels` and `npm run seed:ports` seed separately.

## 10. Verified scenarios (2026-09-08)

These were run against a temporary local backend connected to MongoDB:

- Successful signup: `201`, cookie/session created.
- Duplicate signup: `409`.
- Invalid signup: `400`.
- Incorrect-password login: `401`.
- Nonexistent-email login: `401`.
- Successful login and `GET /api/auth/me`: safe user data returned.
- Authenticated `POST /api/vessels/recommend` for 80,000 tonnes: Panamax ranked first with 3 results.
- Authenticated Paradip → Haldia + Handysize compatibility: `compatible: false`, failed `maximumDraft`.
- Logout: `200`; post-logout decision request: `401`.
- Password-storage check: bcrypt verification succeeded; no plaintext stored; default User query omitted `passwordHash`.
- Frontend `npm run build`: passed.

No automated test suite exists. React Router emits non-failing Vite build notices about ignored `"use client"` directives from its package.

## 11. Limitations and known issues

- All business data is demo/placeholder data; no operational usage is valid.
- No catalogue list endpoints; frontend selectors mirror backend seed names manually.
- No automated test runner, CI, password-reset flow, email verification, rate limiting, account recovery, CSRF strategy for a cross-site deployment, or role-based authorization.
- The JWT is a one-day cookie only; there is no refresh-token/revocation list. User deletion invalidates a token because middleware rechecks the user record.
- `npm install` reported one moderate backend audit finding; it was not remediated during this feature because no audit fix was reviewed or applied.
- Origin-port constraints are not evaluated.
- No ML, forecasting, shipping-market, tide, berth, weather, or freight-rate inputs exist.
- `README.md` and older planning documents predate the auth/dashboard implementation. This file is the authoritative current handoff document.

## 12. Completed work and development status

Completed: React dashboard, authenticated routes, local account auth, protected decision APIs, persistent HttpOnly-cookie session, secure password hashing, seeded MongoDB demo catalogues, recommendation engine, and destination compatibility engine.

Current status: functional SIH MVP. Do not remove existing demo disclaimers or change the recommendation/compatibility success contracts without a migration decision.

## 13. Remaining tasks

1. Add authenticated read-only catalogue endpoints and replace static frontend arrays.
2. Add backend and frontend automated tests, including auth boundary tests.
3. Add production-ready cross-origin/CSRF configuration only when deployment topology is known.
4. Replace demo data with governed, source-attributed port and vessel data.
5. Add origin/berth/tide/terminal constraints after requirements are defined.
6. Define an ML problem, data governance, baseline, and evaluation plan before introducing model code.

## 14. Important design decisions

- JWT is stored only in an HttpOnly cookie rather than localStorage to reduce token exposure to JavaScript.
- Bcrypt cost 12 balances a reasonable MVP security posture with local prototype performance.
- Signup authenticates immediately to make the new-user flow direct.
- Existing decision APIs are authenticated, but payload/response formats remain unchanged for valid authenticated requests.
- Health stays public for operational checks.
- Routing uses only React Router; no UI framework was added.

## 15. Instructions for future AI agents

1. Read this file and inspect actual implementation before coding. Existing root documents may describe pre-auth state.
2. Preserve the demo-data disclaimer and do not claim operational validity.
3. Do not expose `passwordHash`, return JWT values in JSON, move tokens to localStorage, or weaken `JWT_SECRET` validation.
4. Preserve the Vite `/api` proxy and `credentials: 'include'` on authenticated frontend calls.
5. Keep new endpoint validation and user-facing errors consistent with existing Express controller patterns.
6. Do not rewrite the vessel recommendation or port compatibility engines when adding adjacent features.
7. Do not commit or alter real environment secrets unless explicitly asked.
