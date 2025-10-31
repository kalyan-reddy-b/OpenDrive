import { File as FileType, Folder } from '../lib/supabase';
import {
  File,
  Folder as FolderIcon,
  Image,
  FileText,
  Download,
  Trash2,
  Edit2,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FileGridProps {
  files: FileType[];
  folders: Folder[];
  loading: boolean;
  onFolderClick: (folderId: string) => void;
  onDeleteFile: (fileId: string, filePath: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  currentFolder: string | null;
  onBackClick: () => void;
}

export default function FileGrid({
  files,
  folders,
  loading,
  onFolderClick,
  onDeleteFile,
  onDeleteFolder,
  onRenameFile,
  currentFolder,
  onBackClick,
}: FileGridProps) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('text/') || mimeType.includes('document')) return FileText;
    return File;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (file: FileType) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  const handleRename = (file: FileType) => {
    const newName = prompt('Enter new name:', file.name);
    if (newName && newName !== file.name) {
      onRenameFile(file.id, newName);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        {currentFolder && (
          <button
            onClick={onBackClick}
            className="mb-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}
        <File className="w-16 h-16 mb-3 text-gray-300" />
        <p className="text-lg">No files or folders yet</p>
        <p className="text-sm">Upload files to get started</p>
      </div>
    );
  }

  return (
    <div>
      {currentFolder && (
        <button
          onClick={onBackClick}
          className="mb-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div
                onClick={() => onFolderClick(folder.id)}
                className="flex-1 flex items-center space-x-3"
              >
                <FolderIcon className="w-10 h-10 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-800 truncate">{folder.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(folder.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDeleteFolder(folder.id)}
                className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}

        {files.map((file) => {
          const FileIcon = getFileIcon(file.mime_type);
          return (
            <div
              key={file.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <FileIcon className="w-10 h-10 text-gray-400 flex-shrink-0" />
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleDownload(file)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-blue-50 rounded"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleRename(file)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-100 rounded"
                    title="Rename"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onDeleteFile(file.id, file.file_path)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <h3 className="font-medium text-gray-800 truncate mb-1" title={file.name}>
                {file.name}
              </h3>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{formatFileSize(file.file_size)}</span>
                <span>{formatDate(file.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
