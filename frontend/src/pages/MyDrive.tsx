import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import {
  FileIcon, FileTextIcon, FileImageIcon, FileVideoIcon,
  MoreVertical, StarIcon, UploadCloudIcon, DownloadIcon,
  Trash2Icon, Edit2Icon, Share2Icon, InfoIcon, RefreshCwIcon,
  AlertCircleIcon, WifiOffIcon, ServerCrashIcon, ClockIcon,
} from 'lucide-react';
import RenameDialog from '../components/RenameDialog';
import { filesApi, type FileDto } from '../api/filesApi';

// ─── Upload state per file ────────────────────────────────────────────────────
interface UploadingFile {
  name: string;
  progress: number;       // 0-100
  status: 'uploading' | 'error';
  errorMsg?: string;
}

// ─── Error helpers ────────────────────────────────────────────────────────────
type AnyError = { userMessage?: string; message?: string; code?: string };

function extractError(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as AnyError;
  return e?.userMessage ?? e?.message ?? fallback;
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  const isNetwork = message.toLowerCase().includes('cannot reach') || message.toLowerCase().includes('network');
  const isTimeout = message.toLowerCase().includes('timed out') || message.toLowerCase().includes('waking');
  const Icon = isNetwork ? WifiOffIcon : isTimeout ? ClockIcon : ServerCrashIcon;

  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <Icon className="w-10 h-10 text-[#E06C75]" />
      <p className="text-sm font-mono text-[#E06C75] max-w-md">{message}</p>
      {(isNetwork || isTimeout) && (
        <p className="text-xs font-mono text-[#8A8F98] max-w-sm">
          {isTimeout
            ? 'The backend server on Render is waking from sleep. This usually takes 30–60 seconds.'
            : 'Make sure VITE_API_URL is set to your backend URL and the backend is running.'}
        </p>
      )}
      <button
        onClick={onRetry}
        className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-[#40423A] hover:bg-[#50524A] rounded-md text-xs font-bold font-mono text-white transition-all"
      >
        <RefreshCwIcon className="w-3.5 h-3.5" /> Try Again
      </button>
    </div>
  );
}

export default function MyDrive() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [files, setFiles] = useState<FileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<{ id: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Fetch files ─────────────────────────────────────────────────────────────
  const fetchFiles = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setLoadError(null);
    try {
      const response = await filesApi.getFiles({
        category: categoryFilter ?? undefined,
        isTrash: false,
        pageSize: 100,
      });
      if (response.success) {
        setFiles(response.data ?? []);
      } else {
        setLoadError(response.message ?? 'Failed to load files');
      }
    } catch (err) {
      setLoadError(extractError(err, 'Failed to load files'));
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // ── Close dropdown on outside click ─────────────────────────────────────────
  useEffect(() => {
    if (!activeDropdown) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-dropdown-menu]') && !t.closest('[data-dropdown-trigger]')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeDropdown]);

  // ── Drag-and-drop ────────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files;
    if (dropped.length > 0) processFiles(Array.from(dropped));
  };

  // ── Upload ───────────────────────────────────────────────────────────────────
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = '';
    processFiles(Array.from(selected));
  };

  const processFiles = async (fileArray: File[]) => {
    // Validate file sizes (100 MB max)
    const oversized = fileArray.filter(f => f.size > 100 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`${oversized.map(f => f.name).join(', ')} exceed the 100 MB limit`);
      return;
    }

    // Initialise progress map
    setUploadingFiles(new Map(
      fileArray.map(f => [f.name, { name: f.name, progress: 0, status: 'uploading' as const }])
    ));

    let successCount = 0;
    let failCount = 0;
    const newFiles: FileDto[] = [];

    for (const file of fileArray) {
      try {
        const response = await filesApi.uploadFile(file, undefined, (pct) => {
          setUploadingFiles(prev => {
            const next = new Map(prev);
            next.set(file.name, { name: file.name, progress: pct, status: 'uploading' });
            return next;
          });
        });

        if (response.success && response.data) {
          newFiles.push(response.data);
          successCount++;
          // Remove from uploading map immediately
          setUploadingFiles(prev => { const n = new Map(prev); n.delete(file.name); return n; });
        } else {
          failCount++;
          const errMsg = response.message ?? 'Upload failed';
          setUploadingFiles(prev => {
            const n = new Map(prev);
            n.set(file.name, { name: file.name, progress: 0, status: 'error', errorMsg: errMsg });
            return n;
          });
        }
      } catch (err) {
        failCount++;
        const errMsg = extractError(err, 'Upload failed');
        setUploadingFiles(prev => {
          const n = new Map(prev);
          n.set(file.name, { name: file.name, progress: 0, status: 'error', errorMsg: errMsg });
          return n;
        });
      }
    }

    // Optimistically prepend successful uploads
    if (newFiles.length > 0) {
      setFiles(prev => [...newFiles, ...prev]);
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} file${failCount > 1 ? 's' : ''} failed to upload`);
      // Auto-clear error rows after 8 seconds
      setTimeout(() => {
        setUploadingFiles(prev => {
          const n = new Map(prev);
          for (const [k, v] of n) { if (v.status === 'error') n.delete(k); }
          return n;
        });
      }, 8_000);
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────────
  const deleteFile = async (id: string) => {
    setActiveDropdown(null);
    setFiles(prev => prev.filter(f => f.id !== id)); // optimistic
    try {
      await filesApi.deleteFile(id, false);
      toast.success('Moved to trash');
    } catch {
      toast.error('Failed to delete'); await fetchFiles(true);
    }
  };

  const downloadFile = async (file: FileDto) => {
    setActiveDropdown(null);
    const toastId = toast.loading(`Downloading ${file.name}…`);
    try {
      await filesApi.downloadFile(file.id, file.name);
      toast.success('Download started', { id: toastId });
    } catch (err) {
      toast.error(extractError(err, 'Download failed'), { id: toastId });
    }
  };

  const toggleFavorite = async (id: string) => {
    setActiveDropdown(null);
    setFiles(prev => prev.map(f => f.id === id ? { ...f, isFavorite: !f.isFavorite } : f));
    try {
      const res = await filesApi.toggleFavorite(id);
      if (res.success && res.data) {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, isFavorite: res.data!.isFavorite } : f));
        toast.success(res.data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch { await fetchFiles(true); toast.error('Failed to update favorite'); }
  };

  const openRename = (id: string, name: string) => {
    setFileToRename({ id, name });
    setRenameDialogOpen(true);
    setActiveDropdown(null);
  };

  const handleRenameConfirm = (newName: string) => {
    if (fileToRename) {
      setFiles(prev => prev.map(f => f.id === fileToRename.id ? { ...f, name: newName } : f));
      toast.success(`Renamed to "${newName}"`);
    }
    setRenameDialogOpen(false);
    setFileToRename(null);
  };

  const toggleDropdown = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeDropdown === id) { setActiveDropdown(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    // Ensure menu doesn't go off screen on the right
    const menuW = 224;
    const left = Math.max(8, Math.min(rect.right - menuW, window.innerWidth - menuW - 8));
    setDropdownPos({ top: rect.bottom + 6, left });
    setActiveDropdown(id);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getFileIcon = (ct: string) => {
    if (ct.includes('image')) return <FileImageIcon className="w-8 h-8 text-[#98C379]" />;
    if (ct.includes('video')) return <FileVideoIcon className="w-8 h-8 text-[#C678DD]" />;
    if (ct.includes('pdf') || ct.includes('text') || ct.includes('word'))
      return <FileTextIcon className="w-8 h-8 text-[#61AFEF]" />;
    return <FileIcon className="w-8 h-8 text-[#A1A6B4]" />;
  };

  const formatSize = (b: number) => {
    if (b === 0) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${s[i]}`;
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const uploadingList = Array.from(uploadingFiles.values());
  const isUploading = uploadingList.some(u => u.status === 'uploading');

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <RenameDialog
        isOpen={renameDialogOpen}
        currentName={fileToRename?.name ?? ''}
        onConfirm={handleRenameConfirm}
        onCancel={() => { setRenameDialogOpen(false); setFileToRename(null); }}
      />

      <div className="space-y-5 pb-12">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-mono">My Drive</h1>
            {categoryFilter && (
              <p className="text-[#A1A6B4] font-mono text-xs mt-1">
                Category: <span className="font-bold text-[#61AFEF] capitalize">{categoryFilter}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchFiles()}
              title="Refresh"
              disabled={isLoading}
              className="p-2 text-[#A1A6B4] hover:text-white rounded-md hover:bg-[#40423A] transition-all disabled:opacity-50"
            >
              <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center bg-[#61AFEF] hover:bg-[#5294CB] text-[#1a1a1a] font-mono font-bold px-5 py-2.5 rounded-md transition-all disabled:opacity-60 text-sm shadow-md shadow-[#61AFEF]/20"
            >
              <UploadCloudIcon className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading…' : 'Upload Files'}
            </button>
          </div>
        </div>

        {/* ── Upload progress rows ── */}
        {uploadingList.length > 0 && (
          <div className="space-y-2">
            {uploadingList.map(u => (
              <div
                key={u.name}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-mono ${
                  u.status === 'error'
                    ? 'bg-[#3D1F22] border-[#E06C75]/60 text-[#E06C75]'
                    : 'bg-[#1e2a38] border-[#2d4a6b]/60 text-[#A1A6B4]'
                }`}
              >
                {u.status === 'error'
                  ? <AlertCircleIcon className="w-4 h-4 shrink-0" />
                  : <UploadCloudIcon className="w-4 h-4 shrink-0 text-[#61AFEF] animate-pulse" />
                }
                <span className="truncate flex-1 text-white">{u.name}</span>
                {u.status === 'error' ? (
                  <span className="text-xs shrink-0 max-w-[200px] text-right leading-tight">{u.errorMsg}</span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-28 h-1.5 bg-[#40423A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#61AFEF] transition-all duration-150 rounded-full"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                    <span className="text-xs w-9 text-right tabular-nums">{u.progress}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Drag-and-drop zone + table ── */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-[#252622] border rounded-xl shadow-lg overflow-hidden transition-all ${
            isDragging ? 'border-[#61AFEF] ring-2 ring-[#61AFEF]/20' : 'border-[#40423A]'
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#252622]/90 z-10 rounded-xl pointer-events-none">
              <div className="flex flex-col items-center gap-2 text-[#61AFEF]">
                <UploadCloudIcon className="w-12 h-12" />
                <span className="font-bold font-mono">Drop files here to upload</span>
              </div>
            </div>
          )}

          <table className="min-w-full divide-y divide-[#40423A]">
            <thead className="bg-[#32332E]">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider font-mono hidden sm:table-cell">Size</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider font-mono hidden md:table-cell">Created</th>
                <th className="px-6 py-3 text-right text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#40423A]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={4}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#40423A] animate-pulse" />
                        <div className="h-3 w-44 rounded bg-[#40423A] animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : loadError ? (
                <tr>
                  <td colSpan={4}>
                    <ErrorBanner message={loadError} onRetry={() => fetchFiles()} />
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                      <UploadCloudIcon className="w-12 h-12 text-[#40423A]" />
                      <p className="text-sm font-mono text-[#A1A6B4]">No files yet. Upload your first file!</p>
                      <button
                        onClick={handleUploadClick}
                        className="mt-1 px-5 py-2 bg-[#61AFEF] hover:bg-[#5294CB] text-[#1a1a1a] rounded-md text-xs font-bold font-mono transition-all"
                      >
                        Upload Files
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                files.map(file => (
                  <tr key={file.id} className="hover:bg-[#2e2f2a] transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.contentType)}
                        <span className="text-sm font-bold text-white font-mono truncate max-w-[200px] sm:max-w-xs">
                          {file.name}
                        </span>
                        {file.isFavorite && <StarIcon className="w-3.5 h-3.5 text-[#E5C07B] fill-current shrink-0" />}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs font-mono text-[#A1A6B4] hidden sm:table-cell">{formatSize(file.size)}</td>
                    <td className="px-6 py-3 text-xs font-mono text-[#A1A6B4] hidden md:table-cell">{formatDate(file.createdAt)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick download */}
                        <button
                          onClick={() => downloadFile(file)}
                          title="Download"
                          className="p-1.5 text-[#A1A6B4] hover:text-white rounded-md hover:bg-[#40423A] transition-all opacity-0 group-hover:opacity-100"
                        >
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                        {/* Quick delete */}
                        <button
                          onClick={() => deleteFile(file.id)}
                          title="Delete"
                          className="p-1.5 text-[#A1A6B4] hover:text-[#E06C75] rounded-md hover:bg-[#40423A] transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                        {/* More menu */}
                        <div className="relative">
                          <button
                            data-dropdown-trigger
                            onClick={e => toggleDropdown(file.id, e)}
                            className="p-1.5 text-[#A1A6B4] hover:text-white rounded-md hover:bg-[#40423A] transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Fixed dropdown portal ── */}
      {activeDropdown && (() => {
        const file = files.find(f => f.id === activeDropdown);
        if (!file) return null;
        return (
          <div
            data-dropdown-menu
            className="fixed bg-[#252622] rounded-lg border border-[#40423A] shadow-2xl z-[9999] w-56 py-1 overflow-hidden"
            style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
          >
            {[
              { icon: Edit2Icon, label: 'Rename', action: () => openRename(file.id, file.name) },
              { icon: StarIcon, label: file.isFavorite ? 'Remove from Favorites' : 'Add to Favorites', action: () => toggleFavorite(file.id) },
              { icon: Share2Icon, label: 'Share', action: () => { setActiveDropdown(null); toast.info('Sharing coming soon'); } },
              { icon: DownloadIcon, label: 'Download', action: () => downloadFile(file) },
              { icon: InfoIcon, label: 'View Details', action: () => { setActiveDropdown(null); } },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-white hover:bg-[#32332E] flex items-center gap-2.5 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-[#A1A6B4]" /> {label}
              </button>
            ))}
            <div className="border-t border-[#40423A] mt-1" />
            <button
              onClick={() => deleteFile(file.id)}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#E06C75] hover:bg-[#3D1F22] flex items-center gap-2.5 transition-colors"
            >
              <Trash2Icon className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        );
      })()}
    </>
  );
}
