# shop-keep

Monorepo layout:

- **`client/`** — React app (Vite). Dev server on port **5173**; proxies `/api` to the Hapi server.
- **`server/`** — Hapi app on port **3000**. Sample route: `GET /api/health`. In production, serves the built client from `client/dist` with SPA fallback to `index.html`.

## Setup

```bash
npm install
```

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