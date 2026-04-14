# shop-keep

Monorepo layout:

- **`client/`** — React app (Vite). Dev server on port **5173**; proxies `/api` to the Hapi server.
- **`server/`** — Hapi app on port **3000**. Sample route: `GET /api/health`. In production, serves the built client from `client/dist` with SPA fallback to `index.html`.

## Setup

```bash
npm install
```

## Configuration

- **Server (Node / Hapi):** copy [`.env.example`](./.env.example) to `.env` at the repo root. The server loads it via [dotenv](https://github.com/motdotla/dotenv) before reading `process.env` (`NODE_ENV`, `HOST`, `PORT`, and any keys you add).
- **Client (Vite):** copy [`client/.env.example`](./client/.env.example) to `client/.env` for local-only frontend settings. Use the `VITE_` prefix for values that must be available in the browser.

## Development

Run the UI and API together:

```bash
npm run dev
```

Open `http://localhost:5173`. The sample page calls `/api/health` through the Vite proxy.

## Production

```bash
npm run build
npm start
```

Then open `http://localhost:3000` (or set `PORT` / `HOST`).

## Deploying on Railway

Railway uses [Railpack](https://docs.railway.com/builds/railpack) for this repo—no Dockerfile needed. [`railway.toml`](./railway.toml) sets the build (`npm ci && npm run build`), start (`npm start`), and a health check on `/api/health`. Railway injects `PORT`; keep `HOST` unset or `0.0.0.0` so the service accepts external traffic. Set any other secrets in the Railway project variables (they appear in `process.env`; a root `.env` file is not required).