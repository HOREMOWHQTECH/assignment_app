# HOREMOW Assignment App

React + Vite frontend for tracking HOREMOW assignments: Bible study, book reading, message logs, soul winning, prayer & fasting, and progress reports.

All data is persisted in **MongoDB** through the Express API in [`backend/`](./backend/README.md). The frontend API modules in `frontend/src/api/` call these endpoints with a Bearer token from login/register.

Admin-only endpoints are enforced on the backend with `protect` + `requireAdmin`, so members and leaders receive `403` even if they call them directly.

## Required backend APIs

Base URL: `/api` (assumed; adjust per environment). All endpoints require auth (Bearer token) unless noted.

### Auth

| Method | Endpoint | Purpose | Frontend module |
|---|---|---|---|
| POST | `/auth/register` | Register (name, email, password, country, state, chapter, zone, role) | `pages/Register.jsx` |
| POST | `/auth/login` | Login (email, password) | `pages/Login.jsx` |
| POST | `/auth/google` | Google OAuth sign-in | `pages/Login.jsx`, `pages/Register.jsx` |
| POST | `/auth/logout` | Invalidate session | `components/UserMenu.jsx` |
| GET | `/auth/me` | Current user profile | `auth/AuthContext.jsx` |
| PATCH | `/auth/me` | Edit profile details | `pages/Settings.jsx` |
| PATCH | `/auth/password` | Change password | `pages/Settings.jsx` |

### Bible Study

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/bible/books` | List Bible books + chapter counts (canonical + admin-added) |
| GET | `/bible/progress` | User's chapter statuses `{ [book]: { [chapter]: 'done' \| 'progress' } }` |
| POST | `/bible/progress` | Log a chapter status change `{ book, chapter, status }` |

Frontend module: `api/bibleStudy.js`

### Books (library)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/books` | List admin-uploaded PDF books `{ id, title, author, audiences, pdf, fileUrl, coverUrl }` |
| GET | `/books/:id` | Book metadata |
| GET | `/books/:id/progress` | Reading state `{ completed, lastRead }` |
| PATCH | `/books/:id/progress` | Update completion/last-read state |
| POST | `/books/:id/complete` | Mark book completed |
| GET | `/books/:id/file` | Stream the uploaded PDF binary |
| GET | `/books/:id/cover` | Stream the admin-uploaded cover image |

Frontend modules: `api/books.js`, `api/admin.js`. There is no generated book catalog, fake cover, or placeholder chapter/page text — every book comes from an admin PDF upload (with an optional real cover image), stored in MongoDB GridFS and served by `GET /books/:id/file` and `GET /books/:id/cover`.

### Messages log

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/messages` | List logged messages `{ title, speaker, audiences[], date }` |
| POST | `/messages` | Log a message listened to |
| DELETE | `/messages/:id` | Remove a log entry |

Frontend module: `api/messages.js`

### Soul Winning

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/souls` | List souls won `{ name, phone, address, note, tag, events[], date }` |
| POST | `/souls` | Record a soul |
| PUT | `/souls/:id` | Update a soul entry |
| DELETE | `/souls/:id` | Remove a soul entry |

Frontend module: `api/souls.js`

### Prayer & Fasting

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/prayer/sessions` | List prayer sessions `{ minutes, events[], date }` |
| POST | `/prayer/sessions` | Save a session (timer stop or manual entry) |
| DELETE | `/prayer/sessions/:id` | Remove a session |

Frontend module: `api/prayer.js`. Sessions store exact `seconds`; `minutes` is kept in sync for targets and reports.

### Admin / configuration

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST/DELETE | `/admin/books` | Manage library books. `POST` accepts `multipart/form-data`: `title`, `author`, `audiences[]`, `file` (PDF), optional `cover` (image). Returns book metadata incl. `pdf: true`, `fileUrl`, and `coverUrl` when a cover was uploaded. |
| GET/POST/DELETE | `/admin/bible-books` | Manage Bible book list |
| GET/PUT | `/admin/benchmarks` | Message benchmarks per event `{ general, women, ministries, youth }` |
| GET/PUT | `/admin/soul-targets` | Soul-winning targets per event |
| GET/PUT | `/admin/prayer-targets` | Daily prayer minutes per event |
| GET/PUT | `/admin/settings` | App module toggles `{ modules: { bibleStudy, books, messages, soulWinning, prayer, reports } }` |

Frontend modules: `api/admin.js`, `api/settings.js`. All of these are implemented in the Admin page (`/admin`), which is reachable only by users with `role: 'admin'`.

### Voice Assistant

The sidebar "Voice AI Assistant" calls the backend and falls back to local keyword routing if the API is unavailable:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/voice/chat` | `{ message: string }` → `{ reply: string, action?: { type: 'navigate', path: string } }` |

Component: `components/VoiceAssistant.jsx`

### Reports

Reports are computed server-side: `GET /reports/summary` returns the aggregated score used by the Reports page.

## Local storage

Only device preferences and the auth token are kept in `localStorage` (`horemow-theme`, `horemow-token`). All assignment data lives in MongoDB. The Settings page can export a JSON snapshot of the server data.

## Events / audiences

Four event tags are used across Messages, Soul Winning and Prayer: `general`, `women`, `ministries`, `youth`. Entries may carry multiple tags.
