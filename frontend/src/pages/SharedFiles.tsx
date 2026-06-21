import { useState, useEffect } from 'react';
import { FileIcon, FileTextIcon, FileImageIcon, FileVideoIcon, DownloadIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { filesApi, type FileDto } from '../api/filesApi';
import { useAuthStore } from '../store/useAuthStore';

export default function SharedFiles() {
  const { user } = useAuthStore();
  const [files, setFiles] = useState<FileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch shared files from the API
  const fetchShared = async () => {
    setIsLoading(true);
    try {
      const response = await filesApi.getSharedFiles();
      setFiles(response.data ?? []);
    } catch {
      toast.error('Failed to load shared files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShared();
  }, []);

  const downloadFile = async (file: FileDto) => {
    const toastId = toast.loading(`Downloading ${file.name}...`);
    try {
      await filesApi.downloadFile(file.id, file.name);
      toast.success('Download completed', { id: toastId });
    } catch {
      toast.error('Download is not available for this file', { id: toastId });
    }
  };

  // Revoke sharing for this file from myself
  const removeShare = async (id: string) => {
    if (!user?.id) {
      toast.error('Session expired. Please sign in again.');
      return;
    }
    if (!confirm('Are you sure you want to remove this shared file shortcut?')) return;

    try {
      const res = await filesApi.removeShare(id, user.id);
      if (res.success) {
        setFiles(prev => prev.filter(f => f.id !== id));
        toast.success('Shared file shortcut removed');
      } else {
        toast.error(res.message ?? 'Failed to remove share');
      }
    } catch {
      toast.error('Failed to remove shared file');
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
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#201515] tracking-tight">Shared with me</h1>
          <p className="text-sm text-[#605D52] mt-1">Files shared with you by other cloud nodes.</p>
        </div>
        <button 
          onClick={fetchShared} 
          title="Refresh shared items"
          className="p-2 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] rounded-[4px] transition-all text-[#201515]"
        >
          <RefreshCwIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Table grid block */}
      <div className="bg-white border border-[#E8E5DF] rounded-[8px] shadow-sm overflow-hidden mt-6">
        <table className="min-w-full divide-y divide-[#E8E5DF]">
          <thead className="bg-[#F7F5F2]">
            <tr>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#605D52] uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#605D52] uppercase tracking-wider hidden sm:table-cell">Size</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#605D52] uppercase tracking-wider hidden md:table-cell">Date Shared</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-[#605D52] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E5DF] bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-xs font-semibold text-[#605D52] animate-pulse">
                  Loading shared files...
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-xs font-semibold text-[#605D52]">
                  No files have been shared with you yet.
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="hover:bg-[#F7F5F2]/50 transition-colors group">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded-[4px] bg-[#F7F5F2] border border-[#E8E5DF]">
                        {getFileIcon(file.contentType)}
                      </div>
                      <span className="text-xs font-semibold text-[#201515] truncate max-w-[220px] sm:max-w-xs group-hover:text-[#FF4F00] transition-colors">
                        {file.name}
                      </span>
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
                        onClick={() => removeShare(file.id)} 
                        title="Remove share shortcut"
                        className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded text-[#36342E] transition-colors"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
