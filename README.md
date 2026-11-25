# HOREMOW Assignment App

React + Vite frontend for tracking HOREMOW assignments: Bible study, book reading, message logs, soul winning, prayer & fasting, and progress reports.

All data is currently persisted in **localStorage** (keys prefixed `horemow-`). Each API module in `frontend/src/api/` contains `TODO` comments marking the backend endpoint each function should call once the API is ready.

## Required backend APIs

Base URL: `/api` (assumed; adjust per environment). All endpoints require auth (Bearer token) unless noted.

### Auth

| Method | Endpoint | Purpose | Frontend TODO location |
|---|---|---|---|
| POST | `/auth/register` | Register (name, email, password, role) | `pages/Register.jsx` |
| POST | `/auth/login` | Login (email, password) | `pages/Login.jsx` |
| POST | `/auth/google` | Google OAuth sign-in | `pages/Login.jsx`, `pages/Register.jsx` |
| POST | `/auth/logout` | Invalidate session | `components/UserMenu.jsx` |
| GET | `/auth/me` | Current user profile | — |

### Bible Study

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/bible/books` | List Bible books + chapter counts (canonical + admin-added) |
| GET | `/bible/progress` | User's chapter statuses `{ [book]: { [chapter]: 'done' \| 'progress' } }` |
| POST | `/bible/progress` | Log a chapter status change `{ book, chapter, status }` |

Storage key today: `horemow-bible-progress` → `api/bibleStudy.js`

### Books (library)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/books` | List all books (built-in + admin-added) with chapters, pages, cover, audiences |
| GET | `/books/:id` | Book detail incl. chapter/page content |
| GET | `/books/:id/progress` | Reading position `{ chapter, page, completed, lastRead }` |
| PATCH | `/books/:id/progress` | Update reading position |
| POST | `/books/:id/complete` | Mark book completed (hard-copy read) |
| GET | `/books/:id/highlights` | List highlights `{ chapter, page, quote }[]` |
| POST | `/books/:id/highlights` | Add highlight |
| DELETE | `/books/:id/highlights/:index` | Remove highlight |
| GET | `/books/:id/file` | Download the uploaded PDF binary (admin-added books) |

Storage keys: `horemow-book-progress`, `horemow-book-highlights`, `horemow-admin-books` → `api/books.js`, `api/admin.js`
PDF binaries are currently stored in **IndexedDB** (`horemow-pdfs` DB) via `api/pdfStore.js` — move to object storage / `GET /books/:id/file` on the backend.

### Messages log

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/messages` | List logged messages `{ title, speaker, audiences[], date }` |
| POST | `/messages` | Log a message listened to |
| DELETE | `/messages/:id` | Remove a log entry |

Storage key: `horemow-messages-log` → `api/messages.js`

### Soul Winning

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/souls` | List souls won `{ name, phone, address, note, tag, events[], date }` |
| POST | `/souls` | Record a soul |
| PUT | `/souls/:id` | Update a soul entry |
| DELETE | `/souls/:id` | Remove a soul entry |

Storage key: `horemow-souls` → `api/souls.js`

### Prayer & Fasting

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/prayer/sessions` | List prayer sessions `{ minutes, events[], date }` |
| POST | `/prayer/sessions` | Save a session (timer stop or manual entry) |
| DELETE | `/prayer/sessions/:id` | Remove a session |

Storage key: `horemow-prayer-sessions` → `api/prayer.js`

### Admin / configuration

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST/DELETE | `/admin/books` | Manage library books. `POST` accepts `multipart/form-data`: `title`, `author`, `audiences[]`, `file` (PDF). Returns book metadata incl. `pdf: true` and a file URL. |
| GET/POST/DELETE | `/admin/bible-books` | Manage Bible book list |
| GET/PUT | `/admin/benchmarks` | Message benchmarks per event `{ general, women, ministries, youth }` |
| GET/PUT | `/admin/soul-targets` | Soul-winning targets per event |
| GET/PUT | `/admin/prayer-targets` | Daily prayer minutes per event |
| GET/PUT | `/admin/settings` | App module toggles `{ modules: { bibleStudy, books, messages, soulWinning, prayer, reports } }` |

Storage keys: `horemow-admin-books`, `horemow-admin-bible-books`, `horemow-benchmarks`, `horemow-soul-targets`, `horemow-prayer-targets`, `horemow-app-settings` → `api/admin.js`, `api/settings.js`

### Voice Assistant

The sidebar "Voice AI Assistant" currently runs fully client-side (Web Speech API + keyword routing). To make it smart, add:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/voice/chat` | `{ message: string }` → `{ reply: string, action?: { type: 'navigate', path: string } }`. Server-side LLM/NLU; client falls back to local keyword matching when unavailable. |

Component: `components/VoiceAssistant.jsx` — swap `respond()` to call this endpoint when connected.

### Reports

Reports are computed client-side from the endpoints above — no dedicated API needed initially. Optional: `GET /reports/summary` for a server-aggregated score.

## Local storage keys (migration map)

| Key | Contents |
|---|---|
| `horemow-theme` | light / dark / system |
| `horemow-display-name` | User display name |
| `horemow-bible-progress` | Bible chapter statuses |
| `horemow-book-progress` | Book reading positions |
| `horemow-book-highlights` | Text highlights |
| `horemow-messages-log` | Logged messages |
| `horemow-souls` | Souls won |
| `horemow-prayer-sessions` | Prayer sessions |
| `horemow-admin-books` | Admin-added books |
| `horemow-admin-bible-books` | Admin-added Bible books |
| `horemow-benchmarks` | Message benchmarks |
| `horemow-soul-targets` | Soul targets per event |
| `horemow-prayer-targets` | Daily prayer minutes per event |
| `horemow-app-settings` | Module visibility toggles |

Settings page (`/settings`) can export/import all `horemow-*` keys as JSON — useful for migrating local data to the backend later.

## Events / audiences

Four event tags are used across Messages, Soul Winning and Prayer: `general`, `women`, `ministries`, `youth`. Entries may carry multiple tags.
