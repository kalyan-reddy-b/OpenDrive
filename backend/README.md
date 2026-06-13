# OpenDrive — Backend API

Built with **.NET 8** using Clean Architecture. Exposes a RESTful JSON API for authentication, file management, folders, notifications, and activity logs. Uses **SQLite** via Entity Framework Core and stores uploaded files on disk.

---

## Architecture

```
OpenDrive.API               → HTTP layer (Controllers, Program.cs, Middleware)
OpenDrive.Application       → Business logic (Services, Interfaces, DTOs, Validators)
OpenDrive.Domain            → Entities, BaseEntity (no framework dependencies)
OpenDrive.Infrastructure    → EF Core DbContext, Migrations, Repository implementation
```

**Key pattern:** Every controller depends only on an `IXxxService` interface. All database access goes through a generic `IRepository<T>`. This keeps the domain and application layers free of infrastructure concerns.

---

## Prerequisites

| Tool | Version |
|------|---------|
| .NET SDK | 8.0+ |
| (Optional) Docker | 20+ |

---

## Local Development

```bash
# From repo root
cd backend

# Restore NuGet packages
dotnet restore

# Run API (auto-creates DB + applies migrations)
cd OpenDrive.API
dotnet run
```

Swagger UI is available at **http://localhost:{PORT}/swagger** when running locally.

The SQLite database file (`opendrive.db`) and the `wwwroot/uploads/` directory are created automatically on first run.

### Apply / create migrations manually

```bash
cd backend

# Apply existing migrations
dotnet ef database update --project OpenDrive.Infrastructure --startup-project OpenDrive.API

# Add a new migration
dotnet ef migrations add MigrationName --project OpenDrive.Infrastructure --startup-project OpenDrive.API
```

---

## Environment Variables / Configuration

All settings live in `appsettings.json` (development) and `appsettings.Production.json` (production).

| Key | Description | Default |
|-----|-------------|---------|
| `ConnectionStrings:DefaultConnection` | SQLite connection string | `Data Source=opendrive.db` |
| `JwtSettings:Secret` | JWT signing key (min 32 chars) | See appsettings |
| `JwtSettings:Issuer` | Token issuer | `OpenDriveAPI` |
| `JwtSettings:Audience` | Token audience | `OpenDriveUsers` |
| `JwtSettings:ExpiryMinutes` | Token lifetime in minutes | `1440` (24 h) |

**In production**, override via environment variables on Render:

```
ConnectionStrings__DefaultConnection=Data Source=/app/data/opendrive.db
JwtSettings__Secret=your_super_long_random_secret_here_min_32_chars
JwtSettings__Issuer=OpenDriveAPI
JwtSettings__Audience=OpenDriveUsers
JwtSettings__ExpiryMinutes=1440
```

---

## API Reference

All routes are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <jwt_token>
```

### Auth — `/api/Auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/Auth/register` | No | Register a new user |
| POST | `/api/Auth/login` | No | Login and receive JWT + refresh token |
| POST | `/api/Auth/refresh` | No | Exchange refresh token for new JWT |

**Register request body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Login request body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Auth response:**
```json
{
  "success": true,
  "data": {
    "userId": "guid",
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJ...",
    "refreshToken": "base64string"
  }
}
```

---

### Files — `/api/Files`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/Files` | Yes | List files (paged, filterable) |
| POST | `/api/Files/upload` | Yes | Upload a file (multipart/form-data) |
| DELETE | `/api/Files/{id}` | Yes | Soft-delete (trash) or hard-delete |
| POST | `/api/Files/{id}/favorite` | Yes | Toggle favorite |
| GET | `/api/Files/{id}/download` | Yes | Download file |

**GET /api/Files — query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `pageNumber` | int | Page number (default: 1) |
| `pageSize` | int | Items per page (default: 20) |
| `folderId` | guid | Filter by folder |
| `category` | string | `documents`, `images`, `videos`, `others` |
| `isFavorite` | bool | Filter favorites only |
| `isTrash` | bool | Show trashed files |

**POST /api/Files/upload — form fields:**

| Field | Type | Required |
|-------|------|----------|
| `file` | IFormFile | Yes |
| `folderId` | guid | No |

Max upload size: **100 MB**

---

### Folders — `/api/Folders`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/Folders` | List all folders |
| POST | `/api/Folders` | Create a folder |
| DELETE | `/api/Folders/{id}` | Delete a folder |

---

### Notifications — `/api/Notifications`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/Notifications/unread` | Get unread notifications |
| PUT | `/api/Notifications/{id}/read` | Mark one as read |
| PUT | `/api/Notifications/read-all` | Mark all as read |

---

## Response Shape

All endpoints return a consistent envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

Paged responses wrap `data` in:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "totalCount": 100,
    "pageNumber": 1,
    "pageSize": 20
  }
}
```

---

## CORS Policy

Allowed origins:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `https://open-drive-cloud.vercel.app` (production frontend)

To add more origins, edit `Program.cs` → `WithOrigins(...)`.

---

## Deployment on Render

### Steps

1. Push your code to GitHub.
2. Go to **Render → New → Web Service**.
3. Connect your repository.
4. Set **Environment**: Docker.
5. Set **Dockerfile path**: `./Dockerfile` (already in `OpenDrive.API/`).
6. Add a **Disk** under Settings → `Mount Path: /app/data`, `Size: 1 GB`.
7. Add environment variables (see table above).
8. Click **Create Web Service**.

### Dockerfile highlights

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/ ./
RUN dotnet restore OpenDrive.sln
RUN dotnet publish OpenDrive.API/OpenDrive.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
RUN mkdir -p /app/data /app/wwwroot/uploads
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["dotnet", "OpenDrive.API.dll"]
```

> **Important:** Render free tier spins down after 15 min of inactivity. The first request after a cold start can take 30–60 seconds. The frontend is configured with a 30-second timeout for regular requests and 120 seconds for uploads to handle this gracefully.

---

## Project Files Reference

| File | Purpose |
|------|---------|
| `OpenDrive.API/Program.cs` | App bootstrap, DI, middleware, CORS, Swagger |
| `OpenDrive.API/Controllers/BaseController.cs` | Extracts `UserId` from JWT claims |
| `OpenDrive.API/Controllers/FilesController.cs` | File CRUD endpoints |
| `OpenDrive.API/Controllers/AuthController.cs` | Register / Login / Refresh |
| `OpenDrive.Application/Services/FileService.cs` | All file business logic |
| `OpenDrive.Application/Services/AuthService.cs` | Registration, login, token issuance |
| `OpenDrive.Application/DTOs/File/FileDto.cs` | File response shape |
| `OpenDrive.Infrastructure/Persistence/ApplicationDbContext.cs` | EF Core DbContext |
| `OpenDrive.Infrastructure/Repositories/Repository.cs` | Generic repository |
| `appsettings.json` | Dev configuration |
| `appsettings.Production.json` | Production configuration |

---

## Security Notes

- Passwords are hashed with **BCrypt** (cost factor 11).
- JWT tokens expire after 24 hours by default.
- All file operations check `UserId` from the JWT — users can only access their own files.
- File uploads are stored in `wwwroot/uploads/{userId}/` — directories are isolated per user.
- Global query filters on EF Core entities prevent cross-user data leaks.
