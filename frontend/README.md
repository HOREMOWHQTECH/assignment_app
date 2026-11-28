# HOREMOW Frontend

React + Vite client for the HOREMOW assignment tracker. All application data comes from the Express API in `backend/` — there is no local database, mock catalog, or generated content.

## Requirements

- Node.js 18+
- Backend running and reachable (see `../backend/README.md`)

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The dev server runs at `http://localhost:5173`.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `API_BASE_URL` | yes | Base URL for every API request, including `/api`. Example: `http://localhost:4000/api`. If the built frontend is served by the same origin as the API, use `/api`. |
| `VITE_GOOGLE_CLIENT_ID` | no | Google Identity Services client ID. Must match `GOOGLE_CLIENT_ID` on the backend. Email/password login works without it. |

`VITE_API_BASE_URL` and the legacy `VITE_API_URL` are accepted as fallbacks. `API_BASE_URL` is read in `vite.config.js` with `loadEnv` and injected at build time, so restart the dev server (and rebuild for production) after changing it.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite development server on port 5173 |
| `npm run build` | Production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally |

## How API wiring works

- `src/api/client.js` is the only place that calls `fetch`. Every request goes through `api()`, `apiForm()` (multipart uploads), or `apiBlob()` (authenticated binary downloads). All three prepend `${API_BASE_URL}` and attach the Bearer token when present.
- `src/auth/AuthContext.jsx` stores the token in `localStorage`, restores the session with `GET /auth/me`, and exposes `login`, `register`, `google`, `logout`, `updateProfile`, and `changePassword`.
- `src/main.jsx` configures React Query with server-error-aware retries. Mutations invalidate the affected queries so screens stay in sync with the server.
- `src/App.jsx` guards authenticated routes and the admin route.
- Cover images and PDFs are protected endpoints, so they are fetched as blobs with the auth header rather than used as plain image/file URLs.

## Endpoint map

| Feature | Frontend module | Backend endpoints |
|---|---|---|
| Auth / profile | `auth/AuthContext.jsx` | `POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/me`, `PATCH /auth/password` |
| Dashboard | `api/dashboard.js` | `GET /dashboard`, `POST /logs` |
| Bible study | `api/bibleStudy.js` | `GET /bible/books`, `GET /bible/progress`, `POST /bible/progress` |
| Books & reader | `api/books.js`, `pages/BookReader.jsx` | `GET /books`, `GET /books/progress`, `PATCH /books/:id/progress`, `POST /books/:id/complete`, `GET /books/:id/file`, `GET /books/:id/cover`, `GET/POST /books/:id/highlights`, `DELETE /books/:id/highlights/:index` |
| Messages | `api/messages.js` | `GET /messages`, `POST /messages`, `DELETE /messages/:id` |
| Soul winning | `api/souls.js` | `GET /souls`, `POST /souls`, `PUT /souls/:id`, `DELETE /souls/:id` |
| Prayer & fasting | `api/prayer.js` | `GET /prayer/sessions`, `POST /prayer/sessions`, `DELETE /prayer/sessions/:id` |
| Reports | `api/reports.js` | `GET /reports/summary` |
| Settings | `api/settings.js` | `GET /settings` |
| Admin | `api/admin.js` | `GET/POST /admin/books`, `DELETE /admin/books/:id`, `GET/POST /admin/bible-books`, `DELETE /admin/bible-books/:id`, `GET/PUT /admin/benchmarks`, `GET/PUT /admin/soul-targets`, `GET/PUT /admin/prayer-targets`, `GET/PUT /admin/settings` |
| Voice assistant | `components/VoiceAssistant.jsx` | `POST /voice/chat` |

Paths in this table are relative to `API_BASE_URL`.

## Data policy

- Books are admin-uploaded PDFs stored in MongoDB GridFS. Covers are optional real images uploaded by an admin.
- Bible books, benchmarks, soul targets, prayer targets, and module toggles come from server config.
- Files in `src/data/` contain only UI labels and display helpers. No seeded records or placeholder content are rendered.

## Production build

```bash
# set API_BASE_URL in .env first
npm run build
npm run preview
```

Serve the `dist/` directory with any static host. Set `CLIENT_ORIGIN` on the backend to the deployed frontend origin (comma-separated for multiple origins). For same-origin deployments, set `API_BASE_URL=/api` and proxy `/api` to the backend.

## Troubleshooting

- **401 on every request**: token expired or backend restarted with a different JWT secret. Sign in again.
- **CORS error**: `CLIENT_ORIGIN` on the backend must include the frontend origin exactly.
- **404 with `/api/api/...`**: `API_BASE_URL` already ends in `/api`; endpoint paths in the app must not include `/api` again.
- **Blank cover images**: covers are authenticated blobs; confirm the user is signed in and the cover was uploaded with the book.
