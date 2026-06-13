# OpenDrive ☁️

A modern, full-stack, cloud-based file storage solution heavily inspired by Google Drive. OpenDrive allows users to upload, organize, share, and manage their files securely in the cloud.

## 🌐 Live Demo

- **Frontend Application:** [https://open-drive-cloud.vercel.app/](https://open-drive-cloud.vercel.app/)
- **Backend API:** [https://opendrive.onrender.com](https://opendrive.onrender.com)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with custom dark mode color palettes)
- **State Management:** Zustand (Auth Store)
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Routing:** React Router DOM

### Backend
- **Framework:** .NET 8 Web API
- **Language:** C#
- **Database:** SQLite
- **ORM:** Entity Framework Core
- **Authentication:** JWT (JSON Web Tokens)
- **Architecture:** Clean Architecture (Domain, Application, Infrastructure, API)

---

## ✨ Features

- **User Authentication:** Secure JWT-based login and registration.
- **File Uploads & Management:** Upload files (up to 100MB), preview types, and organize items.
- **My Drive & Dashboard:** A clean, responsive, dark-mode interface for navigating files.
- **Trash & Recovery:** Soft-delete files into a Trash bin, with the ability to permanently delete or restore them.
- **Notifications:** Real-time in-app notifications for successful uploads and system events.
- **Shared Files & Favorites:** Mark files as favorites and share them seamlessly.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- .NET 8 SDK

### Backend Setup
1. Navigate to the API directory:
   ```bash
   cd backend/OpenDrive.API
   ```
2. The SQLite database uses Entity Framework migrations. Run the backend to auto-migrate the database (or run `dotnet ef database update`):
   ```bash
   dotnet run
   ```
   *The API will start on `http://localhost:5000`.*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required NPM packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

---

## 📄 License
This project is open-source and available under the MIT License.
