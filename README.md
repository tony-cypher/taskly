# Taskly — Plan your day 🗓️⚡

Taskly is a full-stack productivity app: a **todo / task manager** with boards, notes, a calendar, notifications, search, CSV export, stats, and a light/dark theme. It supports **two ways in**: create a real account, or jump straight in with **guest mode** (a private demo workspace with sample data, no signup).

Built to match a reference dashboard design: React frontend + Laravel API + SQLite database.

---

## Features

- **Auth** — register (with confirm-password + show/hide password), sign in, sign out
- **Guest mode** — one click creates a private demo workspace with sample data; the session is remembered across visits
- **Dashboard** — hero header, onboarding tips, notifications, assignments, mini calendar, today's tasks, progress panel, board-meeting invite
- **Tasks** — full CRUD, priority, status, progress %, due dates, boards/labels, filters, toggle done, drag-free reorder
- **Boards** — group tasks into boards (Logo, Email, Meeting, …)
- **Notes** — colored sticky notes with pin/unpin, edit, delete, and live search
- **Calendar** — month view with event dots and an event editor (title, location, time, RSVP accept/decline)
- **Notifications** — in-app notification center with unread badge and mark-as-read
- **Search** — global topbar search across tasks, events, and notes
- **Stats** — completion %, active tasks, due today, overdue
- **Export** — download your tasks as CSV
- **Settings** — profile, avatar, theme, onboarded flag
- **Light / Dark theme**, persisted per user

## Tech stack

| Layer    | Tech                                                              |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS v4, React Router v7, Axios, lucide-react |
| Backend  | Laravel 12 (PHP 8.2+), Sanctum token auth (Bearer tokens)         |
| Database | SQLite (file-based, zero config)                                  |

```
Todo app/
├── backend/    Laravel API — auth, tasks, boards, notes, events, notifications, search, stats, export
├── frontend/   React SPA — Vite dev server proxies /api → backend on port 8000
└── README.md
```

---

## Run it on your local computer

### Prerequisites

- **PHP 8.2+** with the `sqlite3` and `pdo_sqlite` extensions (Herd, XAMPP, or laragon all work)
- **Composer** 2.x
- **Node.js** 18+ and npm

### 1. Install dependencies

From the project root (`Todo app/`):

```bash
cd backend
composer install

cd ../frontend
npm install
```

### 2. Configure the backend

```bash
cd backend

# Create your local env file
cp .env.example .env          # Windows CMD: copy .env.example .env

# Generate the app key
php artisan key:generate

# Create + migrate the SQLite database
php artisan migrate
```

> If `database/database.sqlite` doesn't exist, Laravel will create it on the first migrate — otherwise create it manually: `touch database/database.sqlite` (Windows: `type nul > database\database.sqlite`).

### 3. Start the app (two terminals)

From the project root, in any terminal (VS Code terminal works great — **Terminal → New Terminal**):

**Terminal 1 — backend API (port 8000):**

```bash
php -S 0.0.0.0:8000 -t public public/index.php
```

or, without changing directory:

```bash
npm run api
```

> This runs PHP's built-in server directly — the same thing `php artisan serve` wraps. It binds `0.0.0.0` instead of `127.0.0.1`, which is more reliable on Windows: on some setups `artisan serve`'s loopback bind intermittently fails with `Failed to listen on 127.0.0.1:8000` even though the port is free. If you prefer artisan anyway: `npm run api:artisan`.

**Terminal 2 — frontend (port 5173):**

```bash
cd frontend
npm run dev
```

or from the root:

```bash
npm run web
```

Open **http://127.0.0.1:5173** in your browser — Vite proxies `/api/*` to the backend automatically, so no CORS setup is needed.

> VS Code tip: the default PowerShell terminal runs `php`/`composer` fine. If `npm` complains about *running scripts being disabled*, use the **Git Bash** terminal profile (dropdown next to the `+` in the terminal panel) — or just run `npm run web` from Git Bash / `dev.cmd`-style Command Prompt (`cmd` → type `npm run web`).

### Stopping the app

- In each terminal, press **Ctrl + C**.
- Or from the root: **`npm run stop`** — kills anything on ports 8000/5173 and **waits until Windows fully releases them** (after a kill, Windows can hold a port for a few seconds; starting inside that window is what causes `Failed to listen on 127.0.0.1:8000`).
- If `Failed to listen` still appears on every attempt after a reboot, Windows reserved the port range — pick another port (e.g. `--port=8010`) in the `api` script in [package.json](package.json) and the `target` in [frontend/vite.config.ts](frontend/vite.config.ts).

### Viewing the database

All data lives in one file: [backend/database/database.sqlite](backend/database/database.sqlite).

- **VS Code (GUI, easiest):** install the *SQLite* extension (`alexcvzz.vscode-sqlite`), then `Ctrl+Shift+P` → **SQLite: Open Database** → pick `backend/database/database.sqlite`. Expand `users`, `tasks`, `notes`, … and click a table (or the ▷ play icon) to browse rows; **SQLite: New Query** lets you run SQL.
- **Tinker (quick checks):**

  ```bash
  cd backend
  php artisan tinker
  >>> App\Models\Task::count()
  >>> App\Models\User::where('is_guest', false)->get(['id','name','email'])
  >>> exit
  ```

- **sqlite3 CLI (raw SQL):** not installed by default on Windows — `winget install SQLite.SQLite` then `sqlite3 backend/database/database.sqlite "SELECT * FROM tasks LIMIT 5;"`.

> To wipe all data and start clean: `php artisan migrate:fresh` (drops and recreates all tables).

### Handy commands

| Command                                | What it does                          |
| -------------------------------------- | ------------------------------------- |
| `php artisan migrate:fresh --seed`     | Reset the database                    |
| `npm run api` (root)                   | Run the API (same as artisan serve)   |
| `npm run web` (root)                   | Run the frontend dev server           |
| `npm run stop` (root)                  | Kill ports 8000/5173 + wait for release |
| `npm run logs` (root)                  | Tail the Laravel log live             |
| `php artisan serve`                    | Run the API                           |
| `npm run dev`                          | Run the frontend dev server           |
| `npm run build`                        | Production build of the frontend      |
| `cd frontend && npx tsc -b`            | Typecheck the frontend                |
| `cd frontend && npm run lint`          | Lint the frontend (oxlint)            |

> **Windows + Herd note:** if `php` isn't on your PATH, call Herd's shims with their full path, e.g. `"C:/Users/tonyc/.config/herd/bin/php.bat" artisan serve` (same idea for `composer.bat`).

---

## Guest mode vs. account

- **Continue as guest** — a guest user is created on the server and you get a token; sample boards/tasks/notes/events are seeded so every screen has content. Guest data is private to that guest token.
- **Create account / Sign in** — same features, but the workspace persists under your email and you can sign in from anywhere.

---

## Production

### 1. Harden the backend

Copy `backend/.env.production.example` to `backend/.env` on the server and fill in:

- `APP_ENV=production`, `APP_DEBUG=false`
- `APP_URL=https://your-domain.com`
- `APP_KEY` — generate with `php artisan key:generate`
- Database credentials if you outgrow SQLite (MySQL/Postgres vars are included, commented out)

Then:

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> Serving via `php artisan serve` is fine for a quick demo:
> `php artisan serve --host=0.0.0.0 --port=8000`
> For real deployments use **Nginx/Apache + PHP-FPM** pointing at `backend/public`, or a platform (Forge, Ploi, Railway, etc.).

### 2. Build the frontend

```bash
cd frontend
npm ci
npm run build          # outputs frontend/dist
```

Serve `frontend/dist` with any static host **or** preview it locally:

```bash
npm run preview        # serves dist on http://localhost:4173, /api still proxied to :8000
```

**Where should the API live?**

- **Same origin** (frontend and API on one domain, e.g. behind Nginx: `/` → static dist, `/api` → Laravel): leave `VITE_API_URL` unset — the app calls `/api` relative to itself.
- **Separate domain** (e.g. Vercel/Netlify for the SPA, API elsewhere): set `VITE_API_URL=https://api.your-domain.com/api` before `npm run build` (see [frontend/.env.example](frontend/.env.example)).

### Deploy-platform settings (Vercel / Netlify / Railway-style fields)

**Frontend (static SPA):**

| Setting           | Value                                             |
| ----------------- | ------------------------------------------------- |
| Root directory    | `frontend`                                        |
| Framework preset  | Vite                                              |
| Install command   | `npm ci`                                          |
| Build command     | `npm run build`                                   |
| Output directory  | `dist`                                            |
| Development command | `npm run dev`                                   |
| Env vars          | `VITE_API_URL=https://<your-api-domain>/api` (only if the API is on another domain) |

SPA routing fallback is preconfigured: [frontend/vercel.json](frontend/vercel.json) (Vercel) and [frontend/public/_redirects](frontend/public/_redirects) (Netlify) rewrite deep links like `/notes` to `index.html`.

**Backend (PHP service — e.g. Railway, Render, Fly.io, or a VPS):**

| Setting           | Value                                             |
| ----------------- | ------------------------------------------------- |
| Root directory    | `backend`                                         |
| Install command   | `composer install --no-dev --optimize-autoloader` |
| Build/release cmd | `php artisan migrate --force && php artisan config:cache route:cache view:cache` |
| Start command     | `php -S 0.0.0.0:$PORT -t public public/index.php` (or Nginx + PHP-FPM) |
| Env vars          | see below — set every variable from `backend/.env.production.example` in the platform dashboard |

CORS: with the frontend on a *different* domain, Laravel must allow its origin. Laravel 12's default config allows `*`, but set `SANCTUM_STATEFUL_DOMAINS` and `session`/`cors` config if you later switch to cookie auth — with the current Bearer-token setup, no extra CORS work is needed as long as the framework default stands.

### 3. Run in production

```bash
# backend
php artisan serve --host=0.0.0.0 --port=8000     # quick demo
# or Nginx/Apache + PHP-FPM pointing at backend/public (recommended)

# frontend (static dist)
npx vite preview --host --port 4173              # quick demo
# or any static file server / CDN for frontend/dist (recommended)
```

### Production checklist

- [ ] `APP_ENV=production`, `APP_DEBUG=false` (never leak errors publicly)
- [ ] Fresh `APP_KEY` generated on the server
- [ ] SQLite file lives on a **persistent volume** (`DB_DATABASE=/data/database.sqlite` on Railway/Render/Fly — container filesystems are wiped on redeploys; on a VPS the default `backend/database/database.sqlite` is fine)
- [ ] `php artisan config:cache route:cache view:cache` after each deploy
- [ ] HTTPS enabled; keep `VITE_API_URL` on https too
- [ ] Back up the SQLite file (it holds all app data)
- [ ] Web server blocks access to `backend/.env` and `backend/storage` (only `backend/public` should be web-rooted)

---

## Push to GitHub

The repo root is the `Todo app/` folder (backend + frontend together). Everything sensitive is already ignored: `backend/.env`, `backend/database/*.sqlite`, `vendor/`, `node_modules/`, logs.

```bash
git init
git add .
git commit -m "Taskly: React + Laravel todo app"
git branch -M main
git remote add origin https://github.com/<you>/taskly.git
git push -u origin main
```

> Tip: create the empty repo on GitHub first (no README/.gitignore so the push is clean), then paste your repo URL.

---

## API overview

All routes live under `/api` and (except auth) require `Authorization: Bearer <token>`.

| Area          | Endpoints (typical)                                            |
| ------------- | -------------------------------------------------------------- |
| Auth          | `POST /api/auth/register`, `/login`, `/guest`, `/me`, `/logout` |
| Tasks         | `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/{id}`, toggle, reorder |
| Boards        | `GET/POST /api/boards`, `PUT/DELETE /api/boards/{id}`          |
| Notes         | `GET/POST /api/notes`, `PUT/DELETE /api/notes/{id}`, `PATCH pin` |
| Events        | `GET/POST /api/events`, `PUT/DELETE /api/events/{id}`, RSVP     |
| Notifications | `GET /api/notifications`, mark read                             |
| Search/Stats  | `GET /api/search?q=`, `GET /api/stats`                          |
| Export        | `GET /api/export/tasks.csv`                                     |
| Profile       | `GET/PUT /api/profile`                                          |

---

## Troubleshooting

| Symptom                                      | Fix                                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| Frontend loads but data fails / 401 loops    | Backend isn't running — start `php artisan serve` on port 8000             |
| `could not find driver`                      | Enable `pdo_sqlite` in your `php.ini`                                      |
| `No application encryption key`              | Run `php artisan key:generate`                                             |
| Register/login returns 419 or HTML           | Send `Accept: application/json` (the app already does) — don't hit API from browser address bar |
| Port already in use                          | Change the port (`--port=8001`) and update `frontend/vite.config.ts` proxy target |
