# HOREMOW Backend

Express + MongoDB API for the HOREMOW assignment tracker.

## Run it

Node 18+ and MongoDB are required.

cd backend
npm install
npm run seed
npm run dev

The API runs at `http://localhost:4000/api`; check `GET /api/health`.

## Environment

Copy `.env.example` to `.env` before starting:

- `MONGODB_URI` — your MongoDB connection string.
- `JWT_SECRET` — a long random secret for sign-in tokens.
- `CLIENT_ORIGIN` — frontend address, `http://localhost:5173` by default.
- `GOOGLE_CLIENT_ID` — only needed for Google sign-in.
- `MAX_UPLOAD_MB` — largest book or cover upload, 20 MB by default.
- `AUTO_SEED` — set to `false` to skip seeding on startup.

Set `API_BASE_URL=http://localhost:4000/api` in `frontend/.env` so the client can find this API.

## Admin

Create an admin with `npm run create-admin -- admin@example.com your-password "Admin Name"`.

## Endpoints

All endpoints except the health check need a Bearer token from login or register.

- `/auth` — sign up, sign in, sign out, read and edit your profile, change password.
- `/dashboard` — your home data: goal percentage, streak, and filters. `/logs` stores quick actions.
- `/bible` — list Bible books and save chapter progress. `/bible-study` is the same API under an older name.
- `/books` — list uploaded PDFs, track reading, save highlights, and stream the PDF or cover image.
- `/messages` — save, list, and delete messages you have heard.
- `/souls` — keep track of people you have witnessed to, with tags and event audiences.
- `/prayer` — save and delete prayer sessions with exact seconds.
- `/reports` — the server-calculated score across all five areas of the assignment.
- `/settings` — read which modules are switched on.
- `/admin` — upload books and covers, add Bible books, and change targets and module toggles. Admins only.
- `/voice` — answer simple voice commands and tell the app which page to open.
