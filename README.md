# FreightAI

FreightAI is the foundation for a Smart India Hackathon project: an intelligent decision-support platform for bulk cargo vessel chartering at India's East Coast ports.

This foundation provides a React frontend, an Express API, MongoDB-backed demo catalogues, and project folders reserved for future machine-learning work. It deliberately does **not** include forecasting or authentication yet.

## Project structure

```text
freight-ai/
├── frontend/       # React + Vite user interface
├── backend/        # Node.js + Express API
├── ml/             # Reserved for future Python ML code
├── data/           # Reserved for datasets (not committed by default)
└── README.md
```

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- MongoDB 7 or later (local installation or a MongoDB Atlas connection)

## Run locally

Open two terminals at the repository root.

### 1. Start the backend

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

On macOS/Linux, replace `copy` with `cp`. Set `MONGODB_URI` in `backend/.env` before running the seed command. The API starts at `http://localhost:5000` by default.

### 2. Start the frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The frontend sends its health-check request to the backend through Vite's development proxy.

## Environment variables

Create local `.env` files by copying each `.env.example`; never commit the actual `.env` files.

| Location | Variable | Purpose |
| --- | --- | --- |
| `backend/.env` | `PORT` | API port; defaults to `5000` |
| `backend/.env` | `NODE_ENV` | Runtime environment, such as `development` |
| `backend/.env` | `MONGODB_URI` | Required MongoDB connection string |
| `frontend/.env` | `VITE_API_BASE_URL` | Optional API base URL. Leave empty during local Vite development to use the proxy. |

## Manual checks

1. Visit `http://localhost:5000/api/health` and confirm the JSON response reports `status: "ok"`.
2. Open the Vite frontend URL and click **Check backend health**.
3. Confirm that the page shows the API status and timestamp, without a connection error.

## Vessel recommendations API

Seed the demo vessel catalogue once before using this endpoint:

```bash
cd backend
npm run seed
```

`POST /api/vessels/recommend` accepts a positive cargo quantity in tonnes and returns vessel types whose **demo maximum typical capacity** can carry it. It ranks types within their demo typical range first, then larger vessels by the least unused capacity.

```bash
curl -X POST http://localhost:5000/api/vessels/recommend ^
  -H "Content-Type: application/json" ^
  -d "{\"cargoQuantity\":80000}"
```

All vessel fields and API responses are marked `DEMO_SAMPLE`. They are illustrative development data, not authoritative vessel specifications or chartering advice.

## Port compatibility API

`POST /api/ports/compatibility` validates an origin port, destination port, and vessel type from the demo catalogues. It compares the vessel's demo typical draft, LOA, and beam only against the destination's **DEMO/PLACEHOLDER** limits. Origin constraints are deliberately not evaluated yet, so they can be added later without changing the route contract.

```bash
curl -X POST http://localhost:5000/api/ports/compatibility ^
  -H "Content-Type: application/json" ^
  -d "{\"originPort\":\"Paradip\",\"destinationPort\":\"Haldia\",\"vesselType\":\"Handysize\"}"
```

The API returns `compatible`, `failedConstraints`, and human-readable `reasons`. The seven initial ports—Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Sagar-Sandheads, and Haldia—use illustrative placeholder values only. They must not be treated as actual port infrastructure specifications.

## Useful scripts

| Folder | Command | Description |
| --- | --- | --- |
| `backend` | `npm run dev` | Runs the Express server with automatic restart. |
| `backend` | `npm start` | Runs the Express server normally. |
| `backend` | `npm run seed` | Inserts or updates both labelled demo vessel and port catalogues. |
| `backend` | `npm run seed:vessels` | Inserts or updates only the demo vessel catalogue. |
| `backend` | `npm run seed:ports` | Inserts or updates only the demo placeholder port catalogue. |
| `frontend` | `npm run dev` | Starts the Vite development server. |
| `frontend` | `npm run build` | Produces a production frontend build. |
