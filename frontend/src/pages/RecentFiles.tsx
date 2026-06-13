import { useState, useEffect } from 'react';
import { FileIcon, FileTextIcon, FileImageIcon, FileVideoIcon, DownloadIcon, Trash2Icon, StarIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { filesApi, type FileDto } from '../api/filesApi';

export default function RecentFiles() {
  const [files, setFiles] = useState<FileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecent = async () => {
    setIsLoading(true);
    try {
      // Get most recently created files (first page, sorted by createdAt desc on backend)
      const response = await filesApi.getFiles({ pageSize: 20, isTrash: false });
      setFiles(response.data ?? []);
    } catch {
      toast.error('Failed to load recent files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

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

  const toggleFavorite = async (id: string) => {
    try {
      const res = await filesApi.toggleFavorite(id);
      const updated = res.data;
      setFiles(prev => prev.map(f => f.id === id ? { ...f, isFavorite: updated?.isFavorite ?? !f.isFavorite } : f));
      toast.success(updated?.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      toast.error('Failed to update favorite');
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
          <h1 className="text-4xl font-bold tracking-tight text-white font-mono">Recent Files</h1>
          <p className="text-[#A1A6B4] text-sm mt-2 font-mono">Your most recently added files.</p>
        </div>
        <button onClick={fetchRecent} title="Refresh"
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
                  Loading recent files...
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#A1A6B4] font-mono">
                  No files yet. Upload files from My Drive.
                </td>
              </tr>
            ) : files.map((file) => (
              <tr key={file.id} className="hover:bg-[#32332E] transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.contentType)}
                    <span className="text-sm font-bold text-white font-mono">{file.name}</span>
                    {file.isFavorite && <StarIcon className="w-3.5 h-3.5 text-[#E5C07B] fill-current" />}
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
                    <button onClick={() => toggleFavorite(file.id)} title={file.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      className={`p-1.5 rounded-md hover:bg-[#40423A] transition-all ${file.isFavorite ? 'text-[#E5C07B]' : 'text-[#A1A6B4] hover:text-[#E5C07B]'}`}>
                      <StarIcon className={`w-4 h-4 ${file.isFavorite ? 'fill-current' : ''}`} />
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
