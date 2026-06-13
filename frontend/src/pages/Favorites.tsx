import { useState, useEffect } from 'react';
import { FileIcon, FileTextIcon, FileImageIcon, FileVideoIcon, StarIcon, DownloadIcon, Trash2Icon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { filesApi, type FileDto } from '../api/filesApi';

export default function Favorites() {
  const [files, setFiles] = useState<FileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await filesApi.getFiles({ isFavorite: true, isTrash: false });
      setFiles(response.data ?? []);
    } catch {
      toast.error('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFromFavorites = async (id: string) => {
    try {
      await filesApi.toggleFavorite(id);
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success('Removed from favorites');
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const downloadFile = async (file: FileDto) => {
    try {
      await filesApi.downloadFile(file.id, file.name);
      toast.success(`Downloading ${file.name}`);
    } catch {
      toast.error('Download is not available for this file');
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await filesApi.deleteFile(id, false);
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success('File moved to trash');
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('image')) return <FileImageIcon className="w-8 h-8 text-[#98C379]" />;
    if (contentType.includes('video')) return <FileVideoIcon className="w-8 h-8 text-[#C678DD]" />;
    if (contentType.includes('pdf') || contentType.includes('text')) return <FileTextIcon className="w-8 h-8 text-[#61AFEF]" />;
    return <FileIcon className="w-8 h-8 text-[#A1A6B4]" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-mono">Favorites</h1>
          <p className="text-[#A1A6B4] text-sm mt-2 font-mono">Files you've starred for quick access.</p>
        </div>
        <button onClick={fetchFavorites} title="Refresh"
          className="p-2 text-[#A1A6B4] hover:text-white rounded-md hover:bg-[#40423A] transition-all">
          <RefreshCwIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-[#252622] border border-[#40423A] shadow-xl overflow-hidden mt-8 rounded-lg">
        <table className="min-w-full divide-y divide-[#40423A]">
          <thead className="bg-[#32332E]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Size</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Created</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#40423A]">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#A1A6B4] font-mono">
                  Loading favorites...
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#A1A6B4] font-mono">
                  No favorites yet. Star files from My Drive to see them here.
                </td>
              </tr>
            ) : files.map((file) => (
              <tr key={file.id} className="hover:bg-[#32332E] transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.contentType)}
                    <span className="text-sm font-bold text-white font-mono">{file.name}</span>
                    <StarIcon className="w-3.5 h-3.5 text-[#E5C07B] fill-current" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#A1A6B4]">
                  {formatSize(file.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#A1A6B4]">
                  {formatDate(file.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => downloadFile(file)} title="Download"
                      className="p-1.5 text-[#A1A6B4] hover:text-white rounded-md hover:bg-[#40423A] transition-all">
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeFromFavorites(file.id)} title="Remove from favorites"
                      className="p-1.5 text-[#E5C07B] hover:text-white rounded-md hover:bg-[#40423A] transition-all">
                      <StarIcon className="w-4 h-4 fill-current" />
                    </button>
                    <button onClick={() => deleteFile(file.id)} title="Delete"
                      className="p-1.5 text-[#A1A6B4] hover:text-[#E06C75] rounded-md hover:bg-[#40423A] transition-all">
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
