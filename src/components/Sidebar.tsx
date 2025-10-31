import { HardDrive, Clock, FolderPlus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StorageUsage } from '../lib/supabase';

interface SidebarProps {
  view: 'myDrive' | 'recent';
  onViewChange: (view: 'myDrive' | 'recent') => void;
  storageUsage: StorageUsage | null;
  onCreateFolder: () => void;
}

export default function Sidebar({ view, onViewChange, storageUsage, onCreateFolder }: SidebarProps) {
  const { signOut, user } = useAuth();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const storagePercent = storageUsage
    ? Math.min((storageUsage.total_bytes / (5 * 1024 * 1024 * 1024)) * 100, 100)
    : 0;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold ml-2 text-gray-800">OpenDrive</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <button
          onClick={() => onViewChange('myDrive')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
            view === 'myDrive'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <HardDrive className="w-5 h-5" />
          <span className="font-medium">My Drive</span>
        </button>

        <button
          onClick={() => onViewChange('recent')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
            view === 'recent'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="font-medium">Recent</span>
        </button>

        <button
          onClick={onCreateFolder}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition mt-4"
        >
          <FolderPlus className="w-5 h-5" />
          <span className="font-medium">New Folder</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Storage</span>
            <span className="text-gray-800 font-medium">
              {storageUsage ? formatBytes(storageUsage.total_bytes) : '0 Bytes'} of 5 GB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          {storageUsage && (
            <p className="text-xs text-gray-500 mt-1">
              {storageUsage.file_count} files
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2 truncate" title={user?.email}>
            {user?.email}
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
