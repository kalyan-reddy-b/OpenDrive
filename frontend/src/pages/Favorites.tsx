import { useState, useEffect } from 'react';
import { FileIcon, FileTextIcon, FileImageIcon, FileVideoIcon, StarIcon, DownloadIcon, Trash2Icon, RefreshCwIcon, X as XIcon } from 'lucide-react';
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
      toast.error('Failed to update favorite status');
    }
  };

  const downloadFile = async (file: FileDto) => {
    const toastId = toast.loading(`Downloading ${file.name}...`);
    try {
      await filesApi.downloadFile(file.id, file.name);
      toast.success('Download completed', { id: toastId });
    } catch {
      toast.error('Download is not available for this file', { id: toastId });
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await filesApi.deleteFile(id, false);
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success('Moved to trash');
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('image')) return <FileImageIcon className="w-5 h-5 text-[#FF4F00]" />;
    if (contentType.includes('video')) return <FileVideoIcon className="w-5 h-5 text-[#FF4F00]" />;
    if (contentType.includes('pdf') || contentType.includes('text')) return <FileTextIcon className="w-5 h-5 text-[#FF4F00]" />;
    return <FileIcon className="w-5 h-5 text-[#FF4F00]" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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
    <div className="space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#201515] tracking-tight">Favorites</h1>
          <p className="text-sm text-[#605D52] mt-1">Files you have starred for quick retrieval.</p>
        </div>
        <button 
          onClick={fetchFavorites} 
          title="Refresh favorites list"
          className="p-2 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] rounded-[4px] transition-all text-[#201515]"
        >
          <RefreshCwIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white border border-[#E8E5DF] rounded-[8px] shadow-sm overflow-hidden mt-6">
        <table className="min-w-full divide-y divide-[#E8E5DF]">
          <thead className="bg-[#F7F5F2]">
            <tr>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#605D52] uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#605D52] uppercase tracking-wider hidden sm:table-cell">Size</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#605D52] uppercase tracking-wider hidden md:table-cell">Created</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-[#605D52] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E5DF] bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-xs font-semibold text-[#605D52] animate-pulse">
                  Loading starred files...
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-xs font-semibold text-[#605D52]">
                  No starred files yet. Star files inside My Drive.
                </td>
              </tr>
            ) : files.map((file) => (
              <tr key={file.id} className="hover:bg-[#F7F5F2]/50 transition-colors group bg-white">
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-[4px] bg-[#F7F5F2] border border-[#E8E5DF]">
                      {getFileIcon(file.contentType)}
                    </div>
                    <span className="text-xs font-semibold text-[#201515] truncate max-w-[200px] sm:max-w-xs group-hover:text-[#FF4F00] transition-colors">
                      {file.name}
                    </span>
                    <StarIcon className="w-3.5 h-3.5 text-[#FF4F00] fill-current shrink-0" />
                  </div>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-[10px] font-mono text-[#36342E] hidden sm:table-cell">
                  {formatSize(file.size)}
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-[10px] font-mono text-[#36342E] hidden md:table-cell">
                  {formatDate(file.createdAt)}
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => downloadFile(file)} 
                      title="Download file"
                      className="p-1.5 hover:bg-[#F7F5F2] rounded text-[#36342E] transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeFromFavorites(file.id)} 
                      title="Remove from favorites"
                      className="p-1.5 hover:bg-[#F7F5F2] rounded text-[#36342E] transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteFile(file.id)} 
                      title="Move to trash"
                      className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded text-[#36342E] transition-colors"
                    >
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
