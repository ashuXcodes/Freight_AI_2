# FreightAI Architecture

## System overview

```text
Browser
  |
  | React client (Vite development server)
  | /api proxy in local development
  v
Express API :5000
  |-- GET  /api/health
  |-- POST /api/vessels/recommend
  `-- POST /api/ports/compatibility
          |
          v
MongoDB
  |-- vesseltypes collection (Mongoose VesselType)
  `-- ports collection       (Mongoose Port)

Seed scripts --> MongoDB demo catalogue records

data/ and ml/ --> reserved; no active runtime role
```

## Frontend

The client uses React 19, React DOM, and Vite 7. `frontend/src/main.jsx` mounts `App` under React `StrictMode` and imports `index.css`. In Vite development, requests beginning with `/api` are proxied to `http://localhost:5000`; a separately deployed client can use `VITE_API_BASE_URL`.

The latest committed `App.jsx` was intentionally small: a button requested `GET /api/health` and displayed a timestamp or connection error. It contained no vessel recommendation or port compatibility interface.

At the current working-tree state, `App.jsx` and `index.css` are deleted, while `main.jsx` still imports them. The frontend source is therefore incomplete. The locally present `dist/` bundle was built before those deletions and should be treated as stale generated output.

## Backend request flow

`backend/src/server.js` loads environment configuration, connects to MongoDB, and then listens on the configured port (default `5000`). `backend/src/app.js` configures JSON parsing, the health endpoint, both route groups, and a final generic 500 error handler.

### Vessel recommendation

```text
POST /api/vessels/recommend
  -> vesselController.recommendVessels
  -> vesselRecommendationService.getVesselRecommendations
  -> VesselType.find(maximumTypicalCargoCapacity >= cargoQuantity)
  -> rankVesselTypes
  -> JSON response
```

The controller accepts only a finite, positive numeric `cargoQuantity`; invalid input returns HTTP 400. The service removes non-qualifying types defensively, then ranks candidates as follows:

1. Types whose defined typical capacity range contains the cargo rank before oversized matches.
2. Within either group, lower unused capacity (`maximumTypicalCargoCapacity - cargoQuantity`) ranks first.

The response supplies rank, capacity limits, typical dimensions, capacity surplus, suitability, and demo-data disclaimers. No candidate is an acceptable successful result when cargo exceeds every demo maximum; the endpoint returns an empty recommendation list.

### Port compatibility

```text
POST /api/ports/compatibility
  -> portCompatibilityController.checkPortCompatibility
  -> portCompatibilityService.getPortCompatibility
  -> case-insensitive exact catalogue lookups (parallel)
  -> evaluateDestinationCompatibility
  -> JSON response
```

The controller requires non-empty strings for `originPort`, `destinationPort`, and `vesselType`, returning HTTP 400 with invalid fields if needed. Missing catalogue records produce HTTP 404.

Compatibility compares the selected vessel's typical draft, LOA, and beam to only the destination port's maximum draft, LOA, and beam. It returns a Boolean, each failed constraint, human-readable reasons, the relevant demo data, and `originPortConstraintsEvaluated: false`. The origin is resolved and returned, but no origin limits are checked yet.

## Persistence and data model

MongoDB is required at startup through `MONGODB_URI`. Mongoose owns the connection lifecycle and model validation.

| Model | Important fields | Classification |
| --- | --- | --- |
| `VesselType` | unique name, min/max typical cargo capacity, typical draft/LOA/beam, disclaimer | `DEMO_SAMPLE` |
| `Port` | unique name, country, max draft/LOA/beam, cargo-handling rate, disclaimer | `DEMO_PLACEHOLDER` |

`seedDemoData.js` bulk-upserts both catalogues. `seedDemoVesselTypes.js` and `seedDemoPorts.js` allow them to be seeded independently. The source catalogue has six vessel types (Handysize through Capesize) and seven ports (Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Sagar-Sandheads, and Haldia).

## Error boundaries and operational characteristics

- Environment validation stops startup if `MONGODB_URI` is absent or `PORT` is not numeric.
- Route-specific validation yields HTTP 400, unavailable catalogue records yield HTTP 404, and unhandled backend failures yield HTTP 500.
- The server has no authentication, authorization, request logging, rate limiting, CORS configuration, health dependency check, test suite, or API versioning.
- The frontend has no active route structure, state management beyond the deleted health-check component, or data-entry flow.
