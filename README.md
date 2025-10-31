# OpenDrive - Cloud Storage Application

A full-stack cloud storage web application inspired by Google Drive, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Secure email/password authentication with Supabase Auth
- **File Management**: Upload, download, rename, and delete files
- **Folder Organization**: Create folders and organize files hierarchically
- **Recent Files View**: Quick access to recently uploaded files
- **Search Functionality**: Search files and folders by name
- **Storage Tracking**: Real-time storage usage display with visual progress bar
- **Responsive Design**: Modern, clean UI that works on all devices
- **Secure Storage**: Row Level Security (RLS) ensures users can only access their own files

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Supabase** for:
  - PostgreSQL database
  - Authentication
  - File storage
  - Real-time subscriptions
  - Row Level Security (RLS)

## Project Structure

```
OpenDrive/
├── src/
│   ├── components/
│   │   ├── Auth.tsx           # Login/signup component
│   │   ├── Dashboard.tsx      # Main dashboard container
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Navbar.tsx         # Top navigation bar
│   │   ├── FileUpload.tsx     # File upload component
│   │   └── FileGrid.tsx       # File and folder display
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/
│   │   └── supabase.ts        # Supabase client config
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── .env.example               # Environment variables template
└── README.md
```

## Database Schema

### Tables

**folders**
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `name` (text) - Folder name
- `parent_id` (uuid) - Parent folder (self-reference)
- `path` (text) - Full folder path
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**files**
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `folder_id` (uuid) - References folders
- `name` (text) - Display name
- `original_name` (text) - Original filename
- `file_path` (text) - Storage path
- `file_size` (bigint) - Size in bytes
- `mime_type` (text) - File type
- `is_public` (boolean) - Public sharing flag
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**storage_usage**
- `user_id` (uuid) - Primary key, references auth.users
- `total_bytes` (bigint) - Total storage used
- `file_count` (integer) - Number of files
- `updated_at` (timestamptz)

### Storage Bucket

**user-files**
- Private bucket for user file uploads
- 50MB file size limit
- Organized by user ID folders
- RLS policies ensure users can only access their own files

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OpenDrive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - The database migrations have already been applied
   - Copy your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### Getting Started

1. **Sign Up**: Create a new account with your email and password
2. **Sign In**: Log in to access your personal drive
3. **Upload Files**: Click the "Upload" button to upload files
4. **Create Folders**: Use "New Folder" in the sidebar to organize files
5. **Navigate**: Click on folders to browse, use "Back" to return
6. **Search**: Use the search bar to find files and folders by name
7. **Manage Files**:
   - Download: Click the download icon on any file
   - Rename: Click the edit icon and enter a new name
   - Delete: Click the trash icon to remove files or folders

### Views

- **My Drive**: Browse all your files and folders
- **Recent**: View your 20 most recently uploaded files

### Storage

- Each user has 5GB of storage (configurable)
- Storage usage is tracked automatically
- View your current usage in the sidebar

## Security Features

- **Authentication**: Secure email/password authentication
- **Row Level Security**: Database policies ensure data isolation
- **Storage Policies**: Users can only access their own files
- **Automatic Cleanup**: Cascade deletes remove orphaned data

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Key Features Implementation

**File Upload**
- Files are stored in Supabase Storage bucket
- Automatic metadata tracking in database
- Storage usage updated via database trigger

**Folder Navigation**
- Hierarchical folder structure with parent-child relationships
- Path tracking for easy navigation
- Cascade deletes for folder removal

**Search**
- Client-side filtering for instant results
- Searches both file names and folder names

**Storage Tracking**
- Automatic calculation via PostgreSQL triggers
- Real-time updates on file operations
- Visual progress bar in sidebar

## Future Enhancements

- Drag-and-drop file upload
- File sharing with public links
- Bulk file operations
- File preview for images and documents
- Trash/recycle bin with recovery
- File versioning
- Starred/favorite files
- Mobile app


