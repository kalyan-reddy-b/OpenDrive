# OpenDrive — Frontend

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · React Router v7

---

## ⚡ Quick Start

```bash
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

---

## Environment Variables

Create `.env.local` in the `frontend/` directory:

```env
VITE_API_URL=https://your-backend.onrender.com
```

**If you see "Cannot reach the server"** — this means `VITE_API_URL` is wrong or the backend is sleeping.
Check these in order:

1. **Is your Render backend URL correct?**
   - Go to your Render dashboard, copy the service URL (e.g. `https://opendrive-abc123.onrender.com`)
   - Set it as `VITE_API_URL` in `.env.local` (local) or in Vercel environment variables (production)
   - Do **not** include a trailing slash

2. **Is the backend asleep?**
   - Render free tier spins down after 15 min of inactivity
   - Open `https://your-backend.onrender.com/health` in your browser — it wakes the server
   - The frontend automatically pings `/ping` when you log in to pre-warm the server

3. **Is the backend running locally?**
   - Set `VITE_API_URL=http://localhost:5000` in `.env.local`
   - Make sure `dotnet run` is running in `backend/OpenDrive.API/`
   - Make sure CORS allows `localhost:5173` in `Program.cs` (it does by default)

4. **After changing `.env.local`, restart Vite:**
   ```bash
   # Stop dev server (Ctrl+C), then:
   npm run dev
   ```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── api/
│   ├── axios.ts             # Axios instance — JWT interceptor, timeouts, error messages
│   ├── filesApi.ts          # Upload (with progress), download, delete, restore, favorite
│   ├── authApi.ts           # register, login, refresh
│   ├── foldersApi.ts        # Folder CRUD
│   ├── notificationsApi.ts  # Read/unread notifications
│   └── healthApi.ts         # pingBackend() — wakes Render from sleep
│
├── pages/
│   ├── LandingPage.tsx      # Public marketing page
│   ├── Login.tsx / Register.tsx
│   ├── Dashboard.tsx        # Real data: recent files + stats
│   ├── MyDrive.tsx          # File browser (upload, download, delete, favorite, drag-drop)
│   ├── RecentFiles.tsx
│   ├── Favorites.tsx
│   ├── SharedFiles.tsx
│   ├── Trash.tsx            # Soft-delete restore + permanent delete
│   ├── Settings.tsx         # Profile / billing / notifications / security tabs
│   └── Profile.tsx
│
├── layouts/
│   ├── DashboardLayout.tsx  # Sidebar + header (auth-guarded + backend ping)
│   └── AuthLayout.tsx
│
├── components/
│   ├── RenameDialog.tsx
│   └── ui/                  # Radix/shadcn components
│
└── store/
    └── useAuthStore.ts      # Zustand: token, user, setAuth(), logout()
```

---

## Upload Details

- Max file size: **100 MB** per file
- Multiple files: supported (sequential upload, individual progress bars)
- Drag and drop: drop files directly onto the file table
- Timeout: **3 minutes** per file (explicit per-request, not from interceptor)
- On success: file appears in the list **immediately** (optimistic update)
- On error: inline red error row with specific message, auto-clears after 8 seconds

### Why uploads failed before (fixed)

The original code set `Content-Type: multipart/form-data` in the Axios request interceptor. The problem: Axios sets the `Content-Type` header (including the required `multipart boundary`) **after** the interceptor runs, so manually setting it in the interceptor caused the boundary to be missing, breaking multipart parsing on the server. Fixed by setting `Content-Type: undefined` in the per-request config, letting Axios handle it correctly.

---

## Routing

| Path | Auth | Page |
|------|------|------|
| `/` | No | Landing page |
| `/login` | No | Login |
| `/register` | No | Register |
| `/drive` | **Yes** | My Drive |
| `/dashboard` | **Yes** | Dashboard |
| `/recent` | **Yes** | Recent Files |
| `/favorites` | **Yes** | Favorites |
| `/shared` | **Yes** | Shared with me |
| `/trash` | **Yes** | Trash |
| `/settings` | **Yes** | Settings |

Auth guard is in `DashboardLayout` — redirects to `/login` if no token in Zustand.

---

## Deployment on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import repo
2. Set **Root Directory**: `frontend`
3. Add environment variable: `VITE_API_URL` = `https://your-backend.onrender.com`
4. Deploy

`public/vercel.json` handles SPA routing (no 404 on page refresh).

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| "Cannot reach the server" | Wrong `VITE_API_URL` or backend sleeping | See top of this file |
| "Request timed out" | Render cold start (30–60s) | Wait, then click "Try Again" |
| Files show but favorites don't save | Old backend without `IsFavorite` in `FileDto` | Deploy updated backend |
| Upload progress stuck at 0% | Old `Content-Type` interceptor bug | Fixed in `filesApi.ts` |
| Blank page on `/drive` after Vercel deploy | Missing SPA rewrite | `public/vercel.json` handles this |
| 401 on every request | Token expired or wrong JWT secret | Re-login; check `JwtSettings:Secret` matches on both environments |
