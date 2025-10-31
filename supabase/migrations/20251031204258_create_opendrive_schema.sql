/*
  # OpenDrive Cloud Storage Schema

  ## Overview
  Creates the database structure for a Google Drive-style cloud storage application
  with file management, folder organization, and storage tracking.

  ## New Tables
  
  ### `folders`
  - `id` (uuid, primary key) - Unique folder identifier
  - `user_id` (uuid, references auth.users) - Owner of the folder
  - `name` (text) - Folder name
  - `parent_id` (uuid, self-reference) - Parent folder for nested structure
  - `path` (text) - Full path for easy navigation
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### `files`
  - `id` (uuid, primary key) - Unique file identifier
  - `user_id` (uuid, references auth.users) - Owner of the file
  - `folder_id` (uuid, references folders) - Parent folder
  - `name` (text) - File name
  - `original_name` (text) - Original uploaded filename
  - `file_path` (text) - Storage path in Supabase storage
  - `file_size` (bigint) - Size in bytes
  - `mime_type` (text) - File MIME type
  - `is_public` (boolean) - Whether file has public sharing link
  - `created_at` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### `storage_usage`
  - `user_id` (uuid, primary key, references auth.users) - User identifier
  - `total_bytes` (bigint) - Total storage used in bytes
  - `file_count` (integer) - Total number of files
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own files, folders, and storage data
  - Public files can be accessed by anyone with the link
  
  ## Indexes
  - Indexed on user_id for fast user queries
  - Indexed on folder_id for fast folder listing
  - Indexed on file name for search functionality
*/

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  path text NOT NULL DEFAULT '/',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  name text NOT NULL,
  original_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  is_public boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create storage usage table
CREATE TABLE IF NOT EXISTS storage_usage (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_bytes bigint DEFAULT 0 NOT NULL,
  file_count integer DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_name ON files(name);

-- Enable Row Level Security
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;

-- Folders policies
CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view own files"
  ON files FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public files"
  ON files FOR SELECT
  TO anon
  USING (is_public = true);

CREATE POLICY "Users can create own files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
  ON files FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON files FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage usage policies
CREATE POLICY "Users can view own storage usage"
  ON storage_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage usage"
  ON storage_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage usage"
  ON storage_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO storage_usage (user_id, total_bytes, file_count)
    VALUES (NEW.user_id, NEW.file_size, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_bytes = storage_usage.total_bytes + NEW.file_size,
      file_count = storage_usage.file_count + 1,
      updated_at = now();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE storage_usage
    SET 
      total_bytes = GREATEST(0, total_bytes - OLD.file_size),
      file_count = GREATEST(0, file_count - 1),
      updated_at = now()
    WHERE user_id = OLD.user_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.file_size != NEW.file_size THEN
    UPDATE storage_usage
    SET 
      total_bytes = total_bytes - OLD.file_size + NEW.file_size,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic storage tracking
CREATE TRIGGER track_storage_usage
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_usage();