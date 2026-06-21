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
    if (!confirm('Are you sure you want to permanently delete this file? This action is irreversible.')) return;
    try {
      await filesApi.deleteFile(id, true); // hardDelete = true
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success('File permanently deleted');
    } catch {
      toast.error('Failed to permanently delete file');
    }
  };

  const emptyTrash = async () => {
    if (files.length === 0) return;
    if (!confirm('Are you sure you want to empty the trash? All files will be permanently deleted.')) return;
    
    setIsLoading(true);
    try {
      await Promise.all(files.map(f => filesApi.deleteFile(f.id, true)));
      setFiles([]);
      toast.success('Trash emptied');
    } catch {
      toast.error('Failed to empty trash completely');
      await fetchTrash();
    } finally {
      setIsLoading(false);
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#201515] tracking-tight">Trash</h1>
          <p className="text-sm text-[#605D52] mt-1">Soft-deleted files node database registry.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={fetchTrash} 
            title="Refresh trash"
            className="p-2 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] rounded-[4px] transition-all text-[#201515]"
          >
            <RefreshCwIcon className="w-4 h-4" />
          </button>
          <button
            onClick={emptyTrash}
            disabled={files.length === 0 || isLoading}
            className="px-4 py-2 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px] transition-colors disabled:opacity-50"
          >
            Empty Trash Nodes
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E8E5DF] rounded-[8px] shadow-sm overflow-hidden mt-6">
        <table className="min-w-full divide-y divide-[#E8E5DF]">
          <thead className="bg-[#F7F5F2]">
            <tr>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#605D52] uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#605D52] uppercase tracking-wider hidden sm:table-cell">Size</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#605D52] uppercase tracking-wider hidden md:table-cell">Deleted</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-[#605D52] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E5DF] bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-xs font-semibold text-[#605D52] animate-pulse">
                  Loading trash files...
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-xs font-semibold text-[#605D52]">
                  Trash database is empty.
                </td>
              </tr>
            ) : files.map((file) => (
              <tr key={file.id} className="hover:bg-[#F7F5F2]/50 transition-colors group bg-white">
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="p-1 rounded-[4px] bg-[#F7F5F2] border border-[#E8E5DF]">
                      {getFileIcon(file.contentType)}
                    </div>
                    <span className="text-xs font-semibold text-[#201515] line-through truncate max-w-[200px] sm:max-w-xs group-hover:text-[#FF4F00] transition-colors">
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
                      onClick={() => restoreFile(file.id)} 
                      title="Restore file"
                      className="p-1.5 hover:bg-[#F7F5F2] rounded text-[#36342E] transition-colors"
                    >
                      <RotateCcwIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => permanentDelete(file.id)} 
                      title="Delete permanently"
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
