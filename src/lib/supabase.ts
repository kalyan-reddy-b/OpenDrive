import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  path: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface StorageUsage {
  user_id: string;
  total_bytes: number;
  file_count: number;
  updated_at: string;
}
