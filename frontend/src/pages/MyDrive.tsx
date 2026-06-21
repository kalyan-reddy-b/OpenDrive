import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import {
  FileIcon, FileTextIcon, FileImageIcon, FileVideoIcon,
  MoreVertical, StarIcon, UploadCloudIcon, DownloadIcon,
  Trash2Icon, Edit2Icon, RefreshCwIcon,
  AlertCircleIcon, WifiOffIcon, ServerCrashIcon, ClockIcon, PlusIcon, FolderOpenIcon, ChevronRightIcon, XIcon, UserPlusIcon
} from 'lucide-react';
import RenameDialog from '../components/RenameDialog';
import { filesApi, type FileDto } from '../api/filesApi';
import { foldersApi, type FolderDto } from '../api/foldersApi';

interface UploadingFile {
  name: string;
  progress: number;
  status: 'uploading' | 'error';
  errorMsg?: string;
}

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
    <div className="flex flex-col items-center gap-3 py-12 text-center bg-white border border-[#E8E5DF] p-6 rounded-[8px] my-6 shadow-sm">
      <Icon className="w-10 h-10 text-[#FF4F00]" />
      <p className="text-xs font-semibold text-[#201515] max-w-md uppercase">{message}</p>
      {(isNetwork || isTimeout) && (
        <p className="text-[11px] text-[#605D52] max-w-sm">
          {isTimeout
            ? 'The backend server is waking from sleep. This usually takes 30–60 seconds.'
            : 'Make sure your backend is running locally or configured correctly.'}
        </p>
      )}
      <button
        onClick={onRetry}
        className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px] transition-colors"
      >
        <RefreshCwIcon className="w-3.5 h-3.5" /> Try Again
      </button>
    </div>
  );
}

export default function MyDrive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const currentFolderId = searchParams.get('folderId') || undefined;

  // Files & Folders state
  const [files, setFiles] = useState<FileDto[]>([]);
  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [allFolders, setAllFolders] = useState<FolderDto[]>([]); // Used to compute breadcrumbs path
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Folders creation state
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  // File Sharing modal state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<FileDto | null>(null);
  const [shareTarget, setShareTarget] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Uploading state
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  
  // Dropdown menus state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<{ id: string; name: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // ── Fetch Files & Folders ────────────────────────────────────────────────────
  const fetchDriveContent = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setLoadError(null);
    try {
      // 1. Load Files inside current folder or matching category
      const filesResponse = await filesApi.getFiles({
        category: categoryFilter ?? undefined,
        folderId: currentFolderId,
        isTrash: false,
        pageSize: 100,
      });

      if (filesResponse.success) {
        setFiles(filesResponse.data ?? []);
      } else {
        setLoadError(filesResponse.message ?? 'Failed to load files');
      }

      // 2. Load Subfolders (only if not displaying specific file category)
      if (!categoryFilter) {
        const foldersResponse = await foldersApi.getFolders(currentFolderId);
        setFolders(foldersResponse.data ?? []);
      } else {
        setFolders([]);
      }

      // 3. Load all folders to build breadcrumbs path hierarchy
      const allFoldersResponse = await foldersApi.getFolders();
      setAllFolders(allFoldersResponse.data ?? []);

    } catch (err) {
      setLoadError(extractError(err, 'Failed to connect to drive API. Check backend.'));
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, currentFolderId]);

  useEffect(() => {
    fetchDriveContent();
  }, [fetchDriveContent]);

  // ── Close dropdown menu when clicking outside ────────────────────────────────
  useEffect(() => {
    if (!activeDropdown) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-dropdown-menu]') && !t.closest('[data-dropdown-trigger]')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [activeDropdown]);

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    const dropped = e.dataTransfer.files;
    if (dropped.length > 0) processFiles(Array.from(dropped));
  };

  // ── Upload Handlers ─────────────────────────────────────────────────────────
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const filesToUpload = Array.from(selected);
    processFiles(filesToUpload);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = async (fileArray: File[]) => {
    const oversized = fileArray.filter(f => f.size > 100 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`${oversized.map(f => f.name).join(', ')} exceed the 100 MB limit`);
      return;
    }

    setUploadingFiles(new Map(
      fileArray.map(f => [f.name, { name: f.name, progress: 0, status: 'uploading' as const }])
    ));

    let successCount = 0;
    let failCount = 0;
    const newFiles: FileDto[] = [];

    for (const file of fileArray) {
      try {
        const response = await filesApi.uploadFile(file, currentFolderId, (pct) => {
          setUploadingFiles(prev => {
            const next = new Map(prev);
            next.set(file.name, { name: file.name, progress: pct, status: 'uploading' });
            return next;
          });
        });

        if (response.success && response.data) {
          newFiles.push(response.data);
          successCount++;
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

    if (newFiles.length > 0) {
      setFiles(prev => [...newFiles, ...prev]);
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} file${failCount > 1 ? 's' : ''} failed to upload`);
      setTimeout(() => {
        setUploadingFiles(prev => {
          const n = new Map(prev);
          for (const [k, v] of n) { if (v.status === 'error') n.delete(k); }
          return n;
        });
      }, 8_000);
    }
  };

  // ── Folder Creation ────────────────────────────────────────────────────────
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    setIsCreatingFolder(true);
    try {
      const res = await foldersApi.createFolder({
        name: newFolderName.trim(),
        parentFolderId: currentFolderId
      });
      if (res.success && res.data) {
        setFolders(prev => [res.data!, ...prev]);
        toast.success(`Folder "${newFolderName}" created`);
        setNewFolderName('');
        setFolderDialogOpen(false);
      } else {
        toast.error(res.message ?? 'Failed to create folder');
      }
    } catch (err) {
      toast.error(extractError(err, 'Failed to create folder'));
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const deleteFolder = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete folder "${name}"? This deletes all metadata for it.`)) return;
    try {
      const res = await foldersApi.deleteFolder(id);
      if (res.success) {
        setFolders(prev => prev.filter(f => f.id !== id));
        toast.success(`Deleted folder "${name}"`);
      } else {
        toast.error(res.message ?? 'Failed to delete folder');
      }
    } catch (err) {
      toast.error(extractError(err, 'Failed to delete folder'));
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────────
  const deleteFile = async (id: string) => {
    setActiveDropdown(null);
    setFiles(prev => prev.filter(f => f.id !== id));
    try {
      await filesApi.deleteFile(id, false);
      toast.success('Moved to trash');
    } catch {
      toast.error('Failed to delete');
      await fetchDriveContent(true);
    }
  };

  const downloadFile = async (file: FileDto) => {
    setActiveDropdown(null);
    const toastId = toast.loading(`Downloading ${file.name}…`);
    try {
      await filesApi.downloadFile(file.id, file.name);
      toast.success('Download completed', { id: toastId });
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
        toast.success(res.data.isFavorite ? 'Starred' : 'Unstarred');
      }
    } catch {
      await fetchDriveContent(true);
      toast.error('Failed to update star state');
    }
  };

  // ── File Sharing Trigger ────────────────────────────────────────────────────
  const openShareDialog = (file: FileDto) => {
    setFileToShare(file);
    setShareTarget('');
    setShareDialogOpen(true);
    setActiveDropdown(null);
  };

  const handleShareConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToShare) return;
    if (!shareTarget.trim()) {
      toast.error('Username or email is required');
      return;
    }

    setIsSharing(true);
    try {
      const res = await filesApi.shareFile(fileToShare.id, shareTarget.trim());
      if (res.success) {
        toast.success(`Successfully shared "${fileToShare.name}" with ${shareTarget.trim()}`);
        setShareDialogOpen(false);
        setFileToShare(null);
      } else {
        toast.error(res.message ?? 'Failed to share file');
      }
    } catch (err) {
      toast.error(extractError(err, 'User not found or sharing failed.'));
    } finally {
      setIsSharing(false);
    }
  };

  const openRename = (id: string, name: string) => {
    setFileToRename({ id, name });
    setRenameDialogOpen(true);
    setActiveDropdown(null);
  };

  const handleRenameConfirm = (newName: string) => {
    if (fileToRename) {
      setFiles(prev => prev.map(f => f.id === fileToRename.id ? { ...f, name: newName } : f));
      toast.success(`Renamed file to "${newName}"`);
    }
    setRenameDialogOpen(false);
    setFileToRename(null);
  };

  const toggleDropdown = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeDropdown === id) { setActiveDropdown(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuW = 200;
    const left = Math.max(8, Math.min(rect.right - menuW, window.innerWidth - menuW - 8));
    setDropdownPos({ top: rect.bottom + 4, left });
    setActiveDropdown(id);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getFileIcon = (ct: string) => {
    if (ct.includes('image')) return <FileImageIcon className="w-5 h-5 text-[#FF4F00]" />;
    if (ct.includes('video')) return <FileVideoIcon className="w-5 h-5 text-[#FF4F00]" />;
    if (ct.includes('pdf') || ct.includes('text') || ct.includes('word'))
      return <FileTextIcon className="w-5 h-5 text-[#FF4F00]" />;
    return <FileIcon className="w-5 h-5 text-[#FF4F00]" />;
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

  // Build breadcrumbs list dynamically by walking up the `parentFolderId` tree
  const buildBreadcrumbs = () => {
    const list: { id?: string; name: string }[] = [];
    let currentId = currentFolderId;

    while (currentId) {
      const folder = allFolders.find(f => f.id === currentId);
      if (folder) {
        list.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentFolderId || undefined;
      } else {
        break;
      }
    }
    list.unshift({ id: undefined, name: 'MY DRIVE' });
    return list;
  };

  const breadcrumbs = buildBreadcrumbs();
  const uploadingList = Array.from(uploadingFiles.values());
  const isUploading = uploadingList.some(u => u.status === 'uploading');

  return (
    <>
      <RenameDialog
        isOpen={renameDialogOpen}
        currentName={fileToRename?.name ?? ''}
        onConfirm={handleRenameConfirm}
        onCancel={() => { setRenameDialogOpen(false); setFileToRename(null); }}
      />

      {/* ─── Share Modal (Zapier style) ─── */}
      {shareDialogOpen && fileToShare && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999] p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-[8px] p-6 shadow-xl max-w-md w-full relative">
            <button 
              onClick={() => setShareDialogOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-[#605D52] hover:text-[#201515]"
            >
              <XIcon className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-[#201515] mb-2">Share File</h3>
            <p className="text-xs text-[#605D52] mb-4">
              File: <span className="text-[#FF4F00] font-semibold">{fileToShare.name}</span>
            </p>

            <form onSubmit={handleShareConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">Recipient Username or Email</label>
                <input
                  type="text"
                  required
                  placeholder="colleague@example.com"
                  value={shareTarget}
                  onChange={(e) => setShareTarget(e.target.value)}
                  className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
                />
              </div>

              <button
                type="submit"
                disabled={isSharing}
                className="w-full py-2.5 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px] transition-all"
              >
                {isSharing ? 'Sharing...' : 'Confirm Share'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Folder Creation Dialog (Zapier style) ─── */}
      {folderDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999] p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-[8px] p-6 shadow-xl max-w-md w-full relative">
            <button 
              onClick={() => setFolderDialogOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-[#605D52] hover:text-[#201515]"
            >
              <XIcon className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-[#201515] mb-4">Create New Folder</h3>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Assets"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingFolder}
                className="w-full py-2.5 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px] transition-all"
              >
                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Main View ─── */}
      <div className="space-y-5 pb-12">
        {/* Header Title & Navigation Controls */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#201515] tracking-tight">My Drive</h1>
            {categoryFilter && (
              <p className="text-xs text-[#605D52] font-semibold uppercase mt-0.5">
                Category Filter: <span className="text-[#FF4F00] capitalize">{categoryFilter}</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchDriveContent()}
              title="Refresh Content"
              disabled={isLoading}
              className="p-2 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] rounded-[4px] transition-all disabled:opacity-50 text-[#201515]"
            >
              <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {!categoryFilter && (
              <button
                onClick={() => setFolderDialogOpen(true)}
                className="flex items-center border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] text-[#201515] px-4.5 py-2 text-xs font-semibold rounded-[4px] transition-all"
              >
                <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
                New Folder
              </button>
            )}

            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center bg-[#FF4F00] hover:bg-[#e04500] text-white px-4.5 py-2 text-xs font-semibold rounded-[4px] transition-all"
            >
              <UploadCloudIcon className="w-3.5 h-3.5 mr-1.5" />
              {isUploading ? 'Uploading…' : 'Upload Files'}
            </button>
          </div>
        </div>

        {/* Dynamic Breadcrumbs Path Bar */}
        <div className="bg-[#F7F5F2] border border-[#E8E5DF] p-3 rounded-[6px] flex flex-wrap items-center gap-1.5 select-none shadow-sm">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRightIcon className="w-3.5 h-3.5 text-[#605D52]" />}
              <button
                onClick={() => {
                  if (crumb.id) {
                    setSearchParams({ folderId: crumb.id });
                  } else {
                    setSearchParams({});
                  }
                }}
                className={`text-xs font-semibold uppercase hover:text-[#FF4F00] transition-colors ${
                  idx === breadcrumbs.length - 1 ? 'text-[#FF4F00]' : 'text-[#36342E]'
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Upload progress panels */}
        {uploadingList.length > 0 && (
          <div className="space-y-2">
            {uploadingList.map(u => (
              <div
                key={u.name}
                className={`flex items-center gap-4 px-4 py-3 border border-[#E8E5DF] rounded-[6px] text-xs font-semibold ${
                  u.status === 'error'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-white text-[#201515]'
                }`}
              >
                {u.status === 'error'
                  ? <AlertCircleIcon className="w-4 h-4 shrink-0 text-red-500" />
                  : <UploadCloudIcon className="w-4 h-4 shrink-0 text-[#FF4F00] animate-pulse" />
                }
                <span className="truncate flex-1">{u.name}</span>
                {u.status === 'error' ? (
                  <span className="text-[10px] shrink-0 max-w-[200px] text-right font-medium">{u.errorMsg}</span>
                ) : (
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-24 h-2 bg-[#F7F5F2] border border-[#E8E5DF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF4F00] transition-all duration-150"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono tabular-nums text-[#605D52]">{u.progress}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Subfolders Grid ── */}
        {!categoryFilter && folders.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold text-[#605D52] uppercase tracking-wider">Subfolders</h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {folders.map(folder => (
                <div
                  key={folder.id}
                  className="border border-[#E8E5DF] bg-[#F7F5F2] hover:bg-white hover:border-[#FF4F00] rounded-[8px] p-3 flex items-center justify-between cursor-pointer group transition-all"
                  onClick={() => setSearchParams({ folderId: folder.id })}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-1.5 rounded-[4px] bg-[#FF4F00]/10 text-[#FF4F00] shrink-0 group-hover:bg-[#FF4F00] group-hover:text-white transition-all">
                      <FolderOpenIcon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-semibold text-[#201515] truncate">{folder.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder.id, folder.name);
                    }}
                    title="Delete folder"
                    className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-[#605D52] shrink-0 transition-colors"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Files Table ── */}
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative bg-white border border-[#E8E5DF] rounded-[8px] shadow-sm overflow-hidden transition-all duration-150 ${
            isDragging ? 'bg-[#FF4F00]/5 border-dashed border-[#FF4F00]' : ''
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 pointer-events-none border border-dashed border-[#FF4F00] m-1 rounded-[6px]">
              <UploadCloudIcon className="w-12 h-12 animate-bounce text-[#FF4F00] mb-2" />
              <span className="text-sm font-semibold text-[#201515]">Drop files here to upload</span>
            </div>
          )}

          <div className="overflow-x-auto">
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
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4" colSpan={4}>
                        <div className="flex items-center gap-3 animate-pulse">
                          <div className="w-7 h-7 bg-[#F7F5F2] rounded-[4px]" />
                          <div className="h-3 w-40 bg-[#F7F5F2] rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : loadError ? (
                  <tr>
                    <td colSpan={4}>
                      <ErrorBanner message={loadError} onRetry={() => fetchDriveContent()} />
                    </td>
                  </tr>
                ) : files.length === 0 && folders.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <UploadCloudIcon className="w-10 h-10 text-[#605D52]" />
                        <p className="text-xs font-semibold text-[#605D52]">This folder is empty.</p>
                        <button
                          onClick={handleUploadClick}
                          className="px-4 py-2 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px]"
                        >
                          Upload Files
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-xs font-semibold text-[#605D52]">
                      No files inside this folder.
                    </td>
                  </tr>
                ) : (
                  files.map(file => (
                    <tr key={file.id} className="hover:bg-[#F7F5F2]/50 transition-colors group">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-[4px] bg-[#F7F5F2] border border-[#E8E5DF]">
                            {getFileIcon(file.contentType)}
                          </div>
                          <span className="text-xs font-semibold text-[#201515] truncate max-w-[200px] sm:max-w-xs group-hover:text-[#FF4F00] transition-colors">
                            {file.name}
                          </span>
                          {file.isFavorite && (
                            <StarIcon className="w-3.5 h-3.5 text-[#FF4F00] fill-current shrink-0" />
                          )}
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
                            onClick={() => deleteFile(file.id)}
                            title="Delete file"
                            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded text-[#36342E] transition-colors"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>

                          <button
                            data-dropdown-trigger
                            onClick={e => toggleDropdown(file.id, e)}
                            className="p-1.5 hover:bg-[#F7F5F2] rounded text-[#36342E] transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
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
      </div>

      {/* ── Fixed Dropdown Menu ── */}
      {activeDropdown && (() => {
        const file = files.find(f => f.id === activeDropdown);
        if (!file) return null;
        return (
          <div
            data-dropdown-menu
            className="fixed bg-white border border-[#E8E5DF] rounded-[6px] shadow-lg z-[9999] w-48 py-1 overflow-hidden font-sans"
            style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
          >
            {[
              { icon: Edit2Icon, label: 'Rename', action: () => openRename(file.id, file.name) },
              { icon: StarIcon, label: file.isFavorite ? 'Unstar file' : 'Star file', action: () => toggleFavorite(file.id) },
              { icon: UserPlusIcon, label: 'Share with User', action: () => openShareDialog(file) },
              { icon: DownloadIcon, label: 'Download', action: () => downloadFile(file) },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full text-left px-3 py-2 text-xs text-[#201515] hover:bg-[#F7F5F2] flex items-center gap-2 transition-colors border-b border-[#F7F5F2]"
              >
                <Icon className="w-3.5 h-3.5 text-[#605D52]" /> {label}
              </button>
            ))}
            <button
              onClick={() => deleteFile(file.id)}
              className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <Trash2Icon className="w-3.5 h-3.5" /> Delete File
            </button>
          </div>
        );
      })()}
    </>
  );
}
