# OpenDrive ☁️

A modern, full-stack, cloud-based file storage solution inspired by Google Drive. OpenDrive allows users to upload, organize, share, and manage their files securely in the cloud.

## 🌐 Live Demo

- **Frontend Application:** [https://open-drive-cloud.vercel.app/](https://open-drive-cloud.vercel.app/)
- **Backend API:** [https://opendrive.onrender.com](https://opendrive.onrender.com)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS with a Zapier-inspired design system (warm whites, orange accent `#FF4F00`)
- **State Management:** Zustand (Auth Store)
- **Icons:** Lucide React
- **HTTP Client:** Axios (with interceptors for JWT injection and FormData handling)
- **Routing:** React Router DOM

### Backend
- **Framework:** .NET 8 Web API
- **Language:** C#
- **Database:** SQLite
- **ORM:** Entity Framework Core 8
- **Authentication:** JWT (JSON Web Tokens) + BCrypt password hashing
- **Architecture:** Monolithic — all layers (Domain, Application, Infrastructure, Controllers) live in a single project

---

## 🏗️ Architecture Overview

The backend is a **single-project ASP.NET Core monolith**. All layers are organized as folders inside the `backend/` directory:

```
backend/
├── Controllers/          # HTTP endpoints (Auth, Files, Folders, Users, Notifications)
├── Application/
│   ├── DTOs/             # Request & response data transfer objects
│   ├── Interfaces/       # Service and repository contracts
│   ├── Services/         # Business logic (AuthService, FileService, etc.)
│   └── Validators/       # FluentValidation rules
├── Domain/
│   └── Entities/         # Core data models (User, File, Folder, Notification, etc.)
├── Infrastructure/
│   ├── Persistence/      # ApplicationDbContext (EF Core)
│   ├── Repositories/     # Generic repository implementation
│   ├── Services/         # TokenService (JWT)
│   └── Migrations/       # EF Core database migrations (SQLite)
├── Program.cs            # App bootstrap, DI, CORS, Auth, Swagger
├── appsettings.json      # Configuration (JWT secrets, DB connection)
└── backend.csproj        # Single project file with all dependencies
```

---

## ✨ Features

- **User Authentication:** Secure JWT-based login and registration with BCrypt password hashing.
- **File Uploads & Management:** Upload files (up to 100 MB), preview file types, rename, move, and delete.
- **My Drive & Dashboard:** Clean, responsive interface for navigating files and folders.
- **Folder Management:** Create nested folders, rename, and delete them.
- **Trash & Recovery:** Soft-delete files into a Trash bin — restore or permanently delete them.
- **Favorites:** Star files for quick access.
- **Notifications:** In-app notifications for uploads and system events.
- **Shared Files:** View and manage files shared with you.
- **Profile Management:** Update first/last name, phone, and bio.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [.NET 8 SDK](https://dotnet.microsoft.com/download)

### 1. Clone the repository
```bash
git clone https://github.com/kalyan-reddy-b/OpenDrive.git
cd OpenDrive
```

### 2. Backend Setup
```bash
cd backend
dotnet run
```
- The API will start on **`http://localhost:5000`**.
- The SQLite database (`opendrive.db`) is created automatically and all migrations are applied on startup.
- Swagger UI is available at `http://localhost:5000/swagger`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- The frontend will start on **`http://localhost:5173`** (or the next available port like `5174`).
- The API base URL is configured in `.env.development` — it defaults to `http://localhost:5000`.

> **Note:** If Vite picks a port other than `5173` (e.g. `5174`), the backend CORS policy already allows ports `5173`, `5174`, and `5175`, so everything will work out of the box.

---

## 🔑 Environment Variables

### Frontend (`.env.development`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | Base URL of the backend API |

### Backend (`appsettings.json`)
| Key | Description |
|---|---|
| `JwtSettings:Secret` | Secret key for signing JWT tokens |
| `JwtSettings:Issuer` | Token issuer |
| `JwtSettings:Audience` | Token audience |
| `ConnectionStrings:DefaultConnection` | SQLite connection string |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
