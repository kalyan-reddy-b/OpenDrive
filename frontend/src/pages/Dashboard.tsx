import { useState, useEffect, useCallback } from 'react';
import { FileText, FolderOpen, Link as LinkIcon, HardDrive, FileImageIcon, FileVideoIcon, FileIcon, RefreshCwIcon, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { filesApi, type FileDto } from '../api/filesApi';
import { foldersApi } from '../api/foldersApi';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentFiles, setRecentFiles] = useState<FileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalFiles, setTotalFiles] = useState(0);
  const [folderCount, setFolderCount] = useState(0);
  const [sharedCount, setSharedCount] = useState(0);
  const [storageUsedBytes, setStorageUsedBytes] = useState(0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diff = (Date.now() - d.getTime()) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('image')) return <FileImageIcon className="h-5 w-5 text-[#FF4F00]" />;
    if (contentType.includes('video')) return <FileVideoIcon className="h-5 w-5 text-[#FF4F00]" />;
    if (contentType.includes('pdf') || contentType.includes('text')) return <FileText className="h-5 w-5 text-[#FF4F00]" />;
    return <FileIcon className="h-5 w-5 text-[#FF4F00]" />;
  };

  // ─── Load Real Stats from APIs ─────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch files to calculate counts and total storage size
      const filesRes = await filesApi.getFiles({ pageSize: 1000, isTrash: false });
      const activeFiles = filesRes.data ?? [];
      setRecentFiles(activeFiles.slice(0, 5)); // Get 5 most recent
      setTotalFiles(filesRes.totalRecords ?? activeFiles.length);

      // Sum file sizes to find storage usage
      const sizeSum = activeFiles.reduce((acc, curr) => acc + curr.size, 0);
      setStorageUsedBytes(sizeSum);

      // 2. Fetch folders count
      const foldersRes = await foldersApi.getFolders();
      setFolderCount(foldersRes.data?.length ?? 0);

      // 3. Fetch shared-with-me files count
      const sharedRes = await filesApi.getSharedFiles();
      setSharedCount(sharedRes.data?.length ?? 0);

    } catch (error) {
      toast.error('Failed to load dashboard metrics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Calculate percentage of 100 GB storage limit
  const quotaBytes = 100 * 1024 * 1024 * 1024; // 100 GB
  const storagePercentage = Math.min(100, parseFloat(((storageUsedBytes / quotaBytes) * 100).toFixed(2)));

  const stats = [
    { title: 'Total Storage', value: formatSize(storageUsedBytes), icon: HardDrive, desc: `${storagePercentage}% of 100 GB limit` },
    { title: 'Your Files', value: isLoading ? '—' : totalFiles.toLocaleString(), icon: FileText, desc: 'Active files in cloud' },
    { title: 'Folders Created', value: isLoading ? '—' : folderCount.toString(), icon: FolderOpen, desc: 'Organised segments' },
    { title: 'Shared with Me', value: isLoading ? '—' : sharedCount.toString(), icon: LinkIcon, desc: 'Incoming collaborative files' },
  ];

  const handleCategoryClick = (category: string) => navigate(`/drive?category=${category}`);

  const categories = [
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'images', label: 'Images', icon: FileImageIcon },
    { key: 'videos', label: 'Videos', icon: FileVideoIcon },
    { key: 'others', label: 'Others', icon: FileIcon },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-[#201515] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#36342E] mt-1">
            Welcome to your OpenDrive workspace. Here is your automation and storage overview.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={isLoading}
          className="p-2 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] rounded-[4px] transition-all disabled:opacity-50 text-[#201515]"
          title="Refresh statistics"
        >
          <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Marquee Separator Band */}
      <div className="marquee-container rounded-[6px]">
        <div className="marquee-content select-none">
          YOUR TOOLS. YOUR RULES. ANY AI. • CLOUD STORAGE WORKSPACE • SECURE METADATA AUTOMATION • NO COMPLEX SHADOWS • ZAPIER ORANGE #FF4F00 • YOUR TOOLS. YOUR RULES. ANY AI. • CLOUD STORAGE WORKSPACE •
        </div>
      </div>

      {/* Statistics Cards (Zapier-style: orange big display stats) */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-[#F7F5F2] border border-[#E8E5DF] rounded-[8px] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-[11px] font-semibold text-[#605D52] uppercase tracking-wider">{stat.title}</h3>
              <stat.icon className="h-4 w-4 text-[#36342E]" />
            </div>
            {/* Big orange stat number */}
            <div className="text-[40px] font-medium text-[#FF4F00] leading-none tracking-tight">{stat.value}</div>
            <p className="text-xs text-[#605D52] mt-2 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Sections split */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-white border border-[#E8E5DF] rounded-[8px] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E8E5DF] bg-[#F7F5F2] flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#201515]">Recent Uploads</h3>
              <p className="text-xs text-[#605D52]">Your most recently pushed files</p>
            </div>
            <button
              onClick={() => navigate('/drive')}
              className="px-3 py-1.5 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] rounded-[4px] text-xs font-semibold text-[#201515] transition-all flex items-center gap-1"
            >
              View drive <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="divide-y divide-[#E8E5DF]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white animate-pulse">
                  <div className="h-9 w-9 border border-[#E8E5DF] bg-[#F7F5F2] rounded-[4px]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-40 bg-[#F7F5F2] rounded" />
                    <div className="h-2.5 w-20 bg-[#F7F5F2] rounded" />
                  </div>
                </div>
              ))
            ) : recentFiles.length === 0 ? (
              <div className="p-12 text-center text-[#605D52] bg-white">
                <p className="text-sm">No files uploaded yet.</p>
                <button 
                  onClick={() => navigate('/drive')} 
                  className="mt-3 px-4 py-2 bg-[#FF4F00] hover:bg-[#e04500] text-white font-semibold text-xs rounded-[4px] transition-colors"
                >
                  Upload First File
                </button>
              </div>
            ) : (
              recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-[#F7F5F2] transition-colors cursor-pointer group bg-white"
                  onClick={() => navigate('/drive')}
                >
                  <div className="h-9 w-9 bg-[#F7F5F2] border border-[#E8E5DF] rounded-[4px] flex items-center justify-center shrink-0">
                    {getFileIcon(file.contentType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#201515] truncate group-hover:text-[#FF4F00] transition-colors">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[#605D52] mt-0.5">{formatDate(file.createdAt)}</p>
                  </div>
                  <div className="text-[10px] text-[#201515] bg-[#F7F5F2] border border-[#E8E5DF] px-2 py-0.5 rounded-[4px] shrink-0 font-mono">
                    {formatSize(file.size)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="lg:col-span-3 bg-white border border-[#E8E5DF] rounded-[8px] shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-[#E8E5DF] bg-[#F7F5F2]">
              <h3 className="text-base font-semibold text-[#201515]">Filter Categories</h3>
              <p className="text-xs text-[#605D52]">Explore your content nodes</p>
            </div>
            
            <div className="p-4 space-y-2">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.key)}
                  className="group w-full flex items-center justify-between p-3 border border-[#E8E5DF] rounded-[6px] hover:border-[#FF4F00] hover:bg-[#F7F5F2]/50 transition-all bg-white"
                >
                  <span className="flex items-center gap-3 text-xs font-semibold text-[#201515]">
                    <div className="p-2 border border-[#E8E5DF] bg-[#F7F5F2] rounded-[4px] text-[#201515] group-hover:bg-[#FF4F00]/10 group-hover:text-[#FF4F00] group-hover:border-[#FF4F00]/20 transition-all">
                      <cat.icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="tracking-wider uppercase font-semibold">{cat.label}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#605D52] bg-[#F7F5F2] border border-[#E8E5DF] px-2 py-0.5 rounded-[4px] group-hover:text-[#FF4F00] group-hover:border-[#FF4F00]/30 transition-all">BROWSE →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick upload anchor block */}
          <div className="p-4 border-t border-[#E8E5DF] bg-[#F7F5F2]/30">
            <button
              onClick={() => navigate('/drive')}
              className="w-full py-3 border border-dashed border-[#E8E5DF] hover:border-[#FF4F00] bg-white hover:bg-[#F7F5F2] text-[#201515] transition-all text-xs font-semibold rounded-[6px] tracking-wide"
            >
              + Upload New Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
