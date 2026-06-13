import { useState, useEffect, useCallback } from 'react';
import { FileText, FolderOpen, Link as LinkIcon, HardDrive, FileImageIcon, FileVideoIcon, FileIcon, RefreshCwIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { filesApi, type FileDto } from '../api/filesApi';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentFiles, setRecentFiles] = useState<FileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalFiles, setTotalFiles] = useState(0);

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
    if (contentType.includes('image')) return <FileImageIcon className="h-5 w-5 text-[#98C379]" />;
    if (contentType.includes('video')) return <FileVideoIcon className="h-5 w-5 text-[#C678DD]" />;
    if (contentType.includes('pdf') || contentType.includes('text')) return <FileText className="h-5 w-5 text-[#61AFEF]" />;
    return <FileIcon className="h-5 w-5 text-[#A1A6B4]" />;
  };

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await filesApi.getFiles({ pageSize: 5, isTrash: false });
      setRecentFiles(res.data ?? []);
      setTotalFiles(res.totalRecords ?? 0);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const stats = [
    { title: 'Total Storage', value: '100 GB', icon: HardDrive, desc: 'Available quota' },
    { title: 'Your Files', value: isLoading ? '—' : totalFiles.toLocaleString(), icon: FileText, desc: 'Across all folders' },
    { title: 'Folders', value: '—', icon: FolderOpen, desc: 'Organised folders' },
    { title: 'Shared Links', value: '—', icon: LinkIcon, desc: 'Active links' },
  ];

  const handleCategoryClick = (category: string) => navigate(`/drive?category=${category}`);

  const categories = [
    { key: 'documents', label: 'Documents', icon: FileText, color: 'text-[#61AFEF]', border: 'hover:border-[#61AFEF]', hoverColor: 'group-hover:text-[#61AFEF]' },
    { key: 'images', label: 'Images', icon: FileImageIcon, color: 'text-[#98C379]', border: 'hover:border-[#98C379]', hoverColor: 'group-hover:text-[#98C379]' },
    { key: 'videos', label: 'Videos', icon: FileVideoIcon, color: 'text-[#C678DD]', border: 'hover:border-[#C678DD]', hoverColor: 'group-hover:text-[#C678DD]' },
    { key: 'others', label: 'Others', icon: FileIcon, color: 'text-[#E5C07B]', border: 'hover:border-[#E5C07B]', hoverColor: 'group-hover:text-[#E5C07B]' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1 text-white font-mono">Dashboard</h1>
          <p className="text-[#A1A6B4] font-mono text-sm">Welcome back! Here's an overview of your drive.</p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={isLoading}
          className="p-2 text-[#A1A6B4] hover:text-white hover:bg-[#40423A] rounded-md transition-all disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-[#252622] p-5 border border-[#40423A] shadow-xl rounded-xl">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider font-mono">{stat.title}</h3>
              <stat.icon className="h-4 w-4 text-[#61AFEF]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
            <p className="text-xs text-[#A1A6B4] mt-1.5 font-mono">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-[#252622] border border-[#40423A] shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#40423A] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-mono">Recent Files</h3>
              <p className="text-xs text-[#A1A6B4] mt-0.5 font-mono">Your most recently uploaded files</p>
            </div>
            <button
              onClick={() => navigate('/drive')}
              className="text-xs font-bold text-[#61AFEF] hover:text-white font-mono transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-[#40423A]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded bg-[#40423A] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-48 rounded bg-[#40423A] animate-pulse" />
                    <div className="h-2 w-24 rounded bg-[#40423A] animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentFiles.length === 0 ? (
              <div className="p-12 text-center text-[#A1A6B4] font-mono text-sm">
                No files yet. <button onClick={() => navigate('/drive')} className="text-[#61AFEF] underline underline-offset-2">Upload your first file</button>
              </div>
            ) : (
              recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-[#32332E] transition-colors cursor-pointer group"
                  onClick={() => navigate('/drive')}
                >
                  <div className="h-10 w-10 bg-[#32332E] border border-[#40423A] flex items-center justify-center rounded-lg shrink-0">
                    {getFileIcon(file.contentType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white font-mono truncate group-hover:text-[#61AFEF] transition-colors">{file.name}</p>
                    <p className="text-xs text-[#8A8F98] font-mono mt-0.5">{formatDate(file.createdAt)}</p>
                  </div>
                  <div className="text-xs font-bold text-[#A1A6B4] font-mono shrink-0">{formatSize(file.size)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Storage Breakdown */}
        <div className="lg:col-span-3 bg-[#252622] border border-[#40423A] shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#40423A]">
            <h3 className="text-base font-bold text-white font-mono">Browse by Category</h3>
            <p className="text-xs text-[#A1A6B4] mt-0.5 font-mono">Filter your files by type</p>
          </div>
          <div className="p-4 space-y-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={`group w-full flex items-center justify-between p-4 border border-[#40423A] ${cat.border} hover:bg-[#32332E] transition-all rounded-lg`}
              >
                <span className={`font-bold flex items-center gap-3 text-white font-mono ${cat.hoverColor} transition-colors`}>
                  <div className="p-2 bg-[#32332E] border border-[#40423A] rounded-md">
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                  </div>
                  {cat.label}
                </span>
                <span className={`text-xs font-mono text-[#8A8F98] ${cat.hoverColor} transition-colors`}>Browse →</span>
              </button>
            ))}
          </div>

          {/* Quick actions */}
          <div className="px-4 pb-4">
            <button
              onClick={() => navigate('/drive')}
              className="w-full py-3 border border-dashed border-[#40423A] hover:border-[#61AFEF] rounded-lg text-xs font-bold font-mono text-[#A1A6B4] hover:text-[#61AFEF] transition-all"
            >
              + Upload New Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
