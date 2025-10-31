import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, File as FileType, Folder, StorageUsage } from '../lib/supabase';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FileGrid from './FileGrid';
import FileUpload from './FileUpload';

export default function Dashboard() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileType[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'myDrive' | 'recent'>('myDrive');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
      loadStorageUsage();
    }
  }, [user, currentFolder, view]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === 'recent') {
        const { data: filesData } = await supabase
          .from('files')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(20);
        setFiles(filesData || []);
        setFolders([]);
      } else {
        const { data: foldersData } = await supabase
          .from('folders')
          .select('*')
          .eq('user_id', user!.id)
          .eq('parent_id', currentFolder)
          .order('name');

        const { data: filesData } = await supabase
          .from('files')
          .select('*')
          .eq('user_id', user!.id)
          .eq('folder_id', currentFolder)
          .order('name');

        setFolders(foldersData || []);
        setFiles(filesData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageUsage = async () => {
    const { data } = await supabase
      .from('storage_usage')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();
    setStorageUsage(data);
  };

  const handleUploadComplete = () => {
    loadData();
    loadStorageUsage();
    setShowUpload(false);
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      loadData();
      loadStorageUsage();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder and all its contents?')) return;

    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Failed to delete folder');
    }
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', fileId);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error renaming file:', error);
      alert('Failed to rename file');
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const path = currentFolder
        ? `${folders.find(f => f.id === currentFolder)?.path || '/'}${name}/`
        : `/${name}/`;

      const { error } = await supabase
        .from('folders')
        .insert({
          user_id: user!.id,
          name,
          parent_id: currentFolder,
          path,
        });

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  const filteredFiles = searchQuery
    ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  const filteredFolders = searchQuery
    ? folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : folders;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        view={view}
        onViewChange={setView}
        storageUsage={storageUsage}
        onCreateFolder={() => {
          const name = prompt('Enter folder name:');
          if (name) handleCreateFolder(name);
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUploadClick={() => setShowUpload(true)}
        />

        <main className="flex-1 overflow-auto p-6">
          {showUpload && (
            <FileUpload
              currentFolder={currentFolder}
              onComplete={handleUploadComplete}
              onCancel={() => setShowUpload(false)}
            />
          )}

          <FileGrid
            files={filteredFiles}
            folders={filteredFolders}
            loading={loading}
            onFolderClick={setCurrentFolder}
            onDeleteFile={handleDeleteFile}
            onDeleteFolder={handleDeleteFolder}
            onRenameFile={handleRenameFile}
            currentFolder={currentFolder}
            onBackClick={() => setCurrentFolder(null)}
          />
        </main>
      </div>
    </div>
  );
}
