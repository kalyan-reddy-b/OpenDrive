# OpenDrive — Cloud Storage SaaS Platform

Full-stack cloud storage built with **.NET 8** + **React 19**. Upload, organise, download, and share files with JWT authentication, real-time progress bars, and a responsive dark-themed dashboard.

---

## 🚨 "Cannot reach the server" — Fix This First

If you see this error, your frontend can't talk to the backend. **Three steps:**

### Step 1 — Find your backend URL
Go to your [Render dashboard](https://dashboard.render.com) → your web service → copy the URL.  
It looks like: `https://opendrive-abc123.onrender.com`

### Step 2 — Set it in the frontend

**Local development** — edit `frontend/.env.local`:
```
VITE_API_URL=https://opendrive-abc123.onrender.com
```
Then restart Vite: `Ctrl+C` → `npm run dev`

**Vercel (production)** — go to Vercel → your project → Settings → Environment Variables:
```
VITE_API_URL = https://opendrive-abc123.onrender.com
```
Then redeploy.

### Step 3 — Wake the backend (Render free tier)
Render free services sleep after 15 minutes. Open this URL in your browser to wake it:
```
https://opendrive-abc123.onrender.com/health
```
Wait until it responds, then try again. The frontend now auto-pings `/ping` on login to pre-warm.

---

## Quick Start (Local)

### Prerequisites: .NET 8 SDK + Node.js 18+

```bash
# Terminal 1 — Backend
cd backend/OpenDrive.API
dotnet run
# → http://localhost:5000  (Swagger at /swagger)

# Terminal 2 — Frontend
cd frontend
npm install
# Edit .env.local: VITE_API_URL=http://localhost:5000
npm run dev
# → http://localhost:5173
```

Open http://localhost:5173, register, and start uploading.

> **Note:** The backend automatically creates a local `backend/OpenDrive.API/data/opendrive.db` SQLite database and a `wwwroot/uploads` folder on first run — no manual setup needed. If you previously saw `SQLite Error 14: unable to open database file`, that was caused by `appsettings.Production.json` pointing to the Docker-only path `/app/data/opendrive.db`. This is now resolved automatically: the API detects when `/app` doesn't exist (i.e. you're running locally) and falls back to a local `data/` folder instead.

---

## Local Development Notes

- **Database**: SQLite file at `backend/OpenDrive.API/data/opendrive.db` (auto-created, auto-migrated on startup).
- **Uploads**: stored in `backend/OpenDrive.API/wwwroot/uploads` (auto-created on startup).
- **Environment**: `dotnet run` defaults to `Development`, using `appsettings.Development.json`/`appsettings.json`. In Docker (`ASPNETCORE_ENVIRONMENT=Production`), `/app/data` is used instead (mounted as a persistent disk on Render).
- If `dotnet run` was previously run with `ASPNETCORE_ENVIRONMENT=Production` set globally on your machine, either unset it or delete any stale `data`/db files and re-run — the new path-resolution logic handles both cases safely either way.

---

## Deploy to Production (Free)

| Service | What | How |
|---------|------|-----|
| [Render](https://render.com) | Backend API | Docker deploy, free tier, 1 GB disk |
| [Vercel](https://vercel.com) | Frontend | Connect repo, set `VITE_API_URL`, deploy |

**Render setup:**
1. New Web Service → Docker → connect repo
2. Dockerfile path: `./backend/OpenDrive.API/Dockerfile`
3. Add Disk: mount path `/app/data`, 1 GB
4. Environment variables: see `backend/README.md`

**Vercel setup:**
1. New Project → import repo → Root Directory: `frontend`
2. Add env var: `VITE_API_URL` = your Render URL
3. Deploy (SPA routing is handled by `public/vercel.json`)

---

## Features

| Feature | Status |
|---------|--------|
| Register / Login (JWT) | ✅ |
| File upload with progress bar | ✅ |
| Drag and drop upload | ✅ |
| File download | ✅ |
| Soft-delete (Trash) + Restore | ✅ |
| Permanent delete | ✅ |
| Favorites | ✅ |
| Category filter (documents/images/videos/others) | ✅ |
| Folder management | ✅ |
| Notifications | ✅ |
| Responsive sidebar (mobile-friendly) | ✅ |
| Auth guard on all dashboard routes | ✅ |
| Backend keep-alive ping on login | ✅ |
| Optimistic UI updates | ✅ |

---

## Docs

- **[Backend README →](./backend/README.md)** — API routes, env vars, Render deployment
- **[Frontend README →](./frontend/README.md)** — Setup, troubleshooting, component structure

---

## Stack

**Backend:** .NET 8 · ASP.NET Core Web API · Entity Framework Core · SQLite · BCrypt · JWT  
**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · Axios · React Router v7 · Sonner  
**Deploy:** Render (Docker) + Vercel (static)
