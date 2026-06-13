import { useState, useEffect } from 'react';
import { FileIcon, FileTextIcon, FileImageIcon, FileVideoIcon, RotateCcwIcon, Trash2Icon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { filesApi, type FileDto } from '../api/filesApi';

export default function Trash() {
  const [files, setFiles] = useState<FileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrash = async () => {
    setIsLoading(true);
    try {
      const response = await filesApi.getFiles({ isTrash: true });
      setFiles(response.data ?? []);
    } catch {
      toast.error('Failed to load trash');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // Restore: remove from trash by toggling soft-delete (backend must support restore endpoint)
  // For now, permanent delete is the hard-delete path
  const restoreFile = async (id: string) => {
    try {
      await filesApi.restoreFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success('File restored successfully');
    } catch {
      toast.error('Failed to restore file');
    }
  };

  const permanentDelete = async (id: string) => {
    try {
      await filesApi.deleteFile(id, true); // hardDelete = true
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success('File permanently deleted');
    } catch {
      toast.error('Failed to permanently delete file');
    }
  };

  const emptyTrash = async () => {
    try {
      await Promise.all(files.map(f => filesApi.deleteFile(f.id, true)));
      setFiles([]);
      toast.success('Trash emptied');
    } catch {
      toast.error('Failed to empty trash');
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('image')) return <FileImageIcon className="w-8 h-8 text-[#98C379]" />;
    if (contentType.includes('video')) return <FileVideoIcon className="w-8 h-8 text-[#C678DD]" />;
    if (contentType.includes('word') || contentType.includes('text')) return <FileTextIcon className="w-8 h-8 text-[#61AFEF]" />;
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
          <h1 className="text-4xl font-bold tracking-tight text-white font-mono">Trash</h1>
          <p className="text-[#A1A6B4] text-sm mt-2 font-mono">Items in trash are deleted forever after 30 days.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchTrash} title="Refresh"
            className="p-2 text-[#A1A6B4] hover:text-white rounded-md hover:bg-[#40423A] transition-all">
            <RefreshCwIcon className="w-4 h-4" />
          </button>
          <button
            onClick={emptyTrash}
            disabled={files.length === 0 || isLoading}
            className="bg-[#252622] border border-[#E06C75] text-[#E06C75] hover:bg-[#E06C75] hover:text-white font-mono px-6 py-2.5 transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
          >
            Empty Trash
          </button>
        </div>
      </div>

      <div className="bg-[#252622] border border-[#40423A] shadow-xl overflow-hidden mt-8 rounded-lg">
        <table className="min-w-full divide-y divide-[#40423A]">
          <thead className="bg-[#32332E]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Size</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Deleted</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#40423A]">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#A1A6B4] font-mono">
                  Loading trash...
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#A1A6B4] font-mono">
                  Trash is empty.
                </td>
              </tr>
            ) : files.map((file) => (
              <tr key={file.id} className="hover:bg-[#32332E] transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    {getFileIcon(file.contentType)}
                    <span className="text-sm font-bold text-[#8A8F98] line-through font-mono">{file.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A1A6B4] font-mono">
                  {formatSize(file.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A1A6B4] font-mono">
                  {formatDate(file.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => restoreFile(file.id)} title="Restore"
                      className="p-1.5 text-[#A1A6B4] hover:text-[#98C379] rounded-md hover:bg-[#40423A] transition-all">
                      <RotateCcwIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => permanentDelete(file.id)} title="Delete permanently"
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
