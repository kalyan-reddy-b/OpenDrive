# OpenDrive ☁️

A modern, full-stack, cloud-based file storage solution inspired by Google Drive. OpenDrive allows users to upload, organize, share, and manage their files securely in the cloud.

---

## 🌐 Live Demo

* **Frontend:** https://open-drive-cloud.vercel.app/
* **Backend API:** https://opendrive.onrender.com

---

## ✨ Features

### 🔐 Authentication

* Secure user registration and login
* JWT-based authentication
* BCrypt password hashing
* Protected routes and authenticated API access

### 📁 File Management

* Upload files up to 100 MB
* Preview supported file types
* Rename files
* Move files between folders
* Delete files

### 📂 Folder Management

* Create folders
* Create nested folders
* Rename folders
* Delete folders

### ⭐ Favorites

* Mark files as favorites
* Quick access to important files

### 🗑️ Trash & Recovery

* Soft-delete files
* Restore deleted files
* Permanently remove files

### 🔔 Notifications

* Upload notifications
* System notifications
* Activity tracking

### 🤝 Shared Files

* View shared files
* Manage files shared with you

### 👤 Profile Management

* Update profile information
* Edit first and last name
* Update phone number
* Add a bio

### 📊 Dashboard

* Responsive dashboard
* File statistics
* Quick navigation
* Recent activity overview

---

# 🛠️ Tech Stack

## Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* Axios
* React Router DOM
* Lucide React
* React Query

## Backend

* ASP.NET Core 8 Web API
* C#
* Entity Framework Core 8
* SQLite
* JWT Authentication
* BCrypt Password Hashing
* Swagger/OpenAPI

---

# 🏗️ Project Architecture

## Frontend Structure

frontend/

├── src/

│ ├── components/

│ ├── layouts/

│ ├── pages/

│ ├── hooks/

│ ├── services/

│ ├── store/

│ ├── types/

│ ├── utils/

│ └── App.tsx

├── public/

├── package.json

├── vite.config.ts

└── vercel.json

---

## Backend Structure

backend/

├── Controllers/

├── Application/

│ ├── DTOs/

│ ├── Interfaces/

│ ├── Services/

│ ├── Validators/

│ └── Common/

├── Domain/

│ └── Entities/

├── Infrastructure/

│ ├── Persistence/

│ ├── Repositories/

│ ├── Services/

│ └── Migrations/

├── Program.cs

├── appsettings.json

└── backend.csproj

---

# 🚀 Getting Started

## Prerequisites

Install the following:

* Node.js v18 or later
* .NET 8 SDK
* Git

---

# 1️⃣ Clone the Repository

```bash
git clone https://github.com/kalyan-reddy-b/OpenDrive.git
cd OpenDrive
```

# 2️⃣ Backend Setup

```bash
cd backend
dotnet restore
dotnet run
```

The backend will run on:

```text
http://localhost:5000
```

Swagger UI:

```text
http://localhost:5000/swagger
```

---

# 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

## Frontend

Create:

```text
frontend/.env.local
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

---

## Backend

Configure:

```text
backend/appsettings.json
```

Example:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=opendrive.db"
  },
  "JwtSettings": {
    "Secret": "your-super-secret-key",
    "Issuer": "OpenDriveAPI",
    "Audience": "OpenDriveUsers",
    "ExpiryMinutes": 60
  }
}
```

---

# 🔐 Authentication Flow

1. User registers
2. Password is hashed using BCrypt
3. User logs in
4. Backend generates JWT
5. Frontend stores token
6. Axios automatically attaches token to requests
7. Protected APIs validate JWT

---

# 🌐 API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

## Files

```http
GET    /api/files
POST   /api/files/upload
PUT    /api/files/{id}
DELETE /api/files/{id}
```

## Folders

```http
GET    /api/folders
POST   /api/folders
PUT    /api/folders/{id}
DELETE /api/folders/{id}
```

## Profile

```http
GET /api/users/profile
PUT /api/users/profile
```

## Notifications

```http
GET /api/notifications
```

---

# ☁️ Deployment

## Frontend Deployment (Vercel)

Framework Preset:

```text
Vite
```

Build Command:

```text
npm run build
```

Output Directory:

```text
dist
```

Root Directory:

```text
frontend
```

### frontend/vercel.json

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This rewrite rule ensures client-side routes like:

* /login
* /register
* /dashboard
* /drive

work correctly when refreshed or directly accessed.

---

## Backend Deployment (Render)

Deploy using:

* Docker
* Render Blueprint
* render.yaml

Production API:

```text
https://opendrive.onrender.com
```

---

# 📸 Screenshots

Add screenshots inside:

```text
docs/
```

Example:

```markdown
![Dashboard](docs/dashboard.png)
![My Drive](docs/my-drive.png)
![Login](docs/login.png)
```

---

# 🔮 Future Enhancements

* File sharing via links
* Search and filtering
* Drag and drop uploads
* Real-time notifications
* Dark mode
* File version history
* Role-based access control
* Cloud storage providers integration

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Kalyan Reddy B**

GitHub: https://github.com/kalyan-reddy-b

Project Repository:

https://github.com/kalyan-reddy-b/OpenDrive
