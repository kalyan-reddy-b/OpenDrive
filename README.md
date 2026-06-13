# OpenDrive — Cloud Storage SaaS Platform

🌐 **Live Application**

* **Frontend (Vercel):** https://open-drive-cloud.vercel.app/
* **Backend API (Render):** https://opendrive.onrender.com
* **Swagger API Docs:** https://opendrive.onrender.com/swagger

Full-stack cloud storage built with **.NET 8** + **React 19**. Upload, organise, download, and share files with JWT authentication, real-time progress bars, and a responsive dark-themed dashboard.

---

## 🚨 "Cannot reach the server" — Fix This First

If you see this error, your frontend can't talk to the backend.

### Production URLs

```text
Frontend: https://open-drive-cloud.vercel.app/
Backend:  https://opendrive.onrender.com
Swagger:  https://opendrive.onrender.com/swagger
```

### Step 1 — Backend Health Check

Open:

```text
https://opendrive.onrender.com
```

or

```text
https://opendrive.onrender.com/swagger
```

Render free services may take a few seconds to wake up after inactivity.

### Step 2 — Set Frontend Environment Variable

Local development (`frontend/.env.local`):

```env
VITE_API_URL=https://opendrive.onrender.com
```

For Vercel:

```env
VITE_API_URL=https://opendrive.onrender.com
```

Redeploy after updating environment variables.

---

## Quick Start (Local)

### Prerequisites

* .NET 8 SDK
* Node.js 18+

```bash
# Backend
cd backend/OpenDrive.API
dotnet run

# Frontend
cd frontend
npm install
npm run dev
```

---

## Deployment

### Frontend

**Vercel**
https://open-drive-cloud.vercel.app/

### Backend

**Render**
https://opendrive.onrender.com

### API Documentation

**Swagger**
https://opendrive.onrender.com/swagger

---

## Features

| Feature                   | Status |
| ------------------------- | ------ |
| Register / Login (JWT)    | ✅      |
| File Upload               | ✅      |
| Drag & Drop Upload        | ✅      |
| File Download             | ✅      |
| Folder Management         | ✅      |
| Favorites                 | ✅      |
| Trash & Restore           | ✅      |
| Notifications             | ✅      |
| Responsive Dashboard      | ✅      |
| JWT Authentication        | ✅      |
| Swagger API Documentation | ✅      |

---

## Tech Stack

### Backend

* ASP.NET Core 8
* Entity Framework Core
* SQLite
* JWT Authentication
* FluentValidation
* Swagger/OpenAPI

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* Axios
* React Router

### Deployment

* Vercel (Frontend)
* Render (Backend)
* GitHub (Source Control)
