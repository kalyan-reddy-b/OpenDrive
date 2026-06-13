import { useState, useRef } from 'react';
import { FileIcon, FileTextIcon, FileImageIcon, FileVideoIcon, UsersIcon, DownloadIcon, MoreVertical, Share2Icon, InfoIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import RenameDialog from '../components/RenameDialog';

// NOTE: The backend does not yet expose a "shared with me" endpoint.
// This page retains its UI structure and will be wired up once
// GET /api/FileShares (or equivalent) is added to the backend.
interface SharedFileData {
  id: string;
  name: string;
  size: number;
  contentType: string;
  sharedBy: string;
  dateShared: string;
}

export default function SharedFiles() {
  const [files] = useState<SharedFileData[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<{ id: string; name: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleRenameConfirm = (newName: string) => {
    if (fileToRename) {
      toast.success(`File renamed to ${newName}`);
    }
    setRenameDialogOpen(false);
    setFileToRename(null);
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

  return (
    <>
      <RenameDialog
        isOpen={renameDialogOpen}
        currentName={fileToRename?.name || ''}
        onConfirm={handleRenameConfirm}
        onCancel={() => { setRenameDialogOpen(false); setFileToRename(null); }}
      />

      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-mono">Shared with me</h1>
          <p className="text-[#A1A6B4] text-sm mt-2 font-mono">Files that colleagues have shared with you.</p>
        </div>

        <div className="bg-[#252622] border border-[#40423A] shadow-xl overflow-hidden mt-8 rounded-lg">
          <table className="min-w-full divide-y divide-[#40423A]">
            <thead className="bg-[#32332E]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Shared By</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Date Shared</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Size</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#40423A]">
              {files.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#A1A6B4] font-mono">
                    No files have been shared with you yet.
                  </td>
                </tr>
              ) : files.map((file) => (
                <tr key={file.id} className="hover:bg-[#32332E] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.contentType)}
                      <span className="text-sm font-bold text-white font-mono">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-[#8A8F98]" />
                      <span className="text-sm text-[#A1A6B4] font-mono">{file.sharedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A1A6B4] font-mono">{file.dateShared}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A1A6B4] font-mono">{formatSize(file.size)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-[#A1A6B4] hover:text-white rounded-md hover:bg-[#40423A] transition-all" title="Download">
                        <DownloadIcon className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          data-dropdown-trigger
                          onClick={() => setActiveDropdown(activeDropdown === file.id ? null : file.id)}
                          className="p-1.5 text-[#A1A6B4] hover:text-white rounded-md hover:bg-[#40423A] transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeDropdown === file.id && (
                          <div data-dropdown-menu ref={dropdownRef} className="absolute right-0 top-10 mt-1 w-56 bg-[#252622] border border-[#40423A] shadow-2xl z-50 text-left rounded-md overflow-hidden">
                            <button onClick={() => setActiveDropdown(null)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-white hover:bg-[#32332E] border-b border-[#40423A] flex items-center"><Share2Icon className="w-3.5 h-3.5 mr-2" /> Share</button>
                            <button onClick={() => setActiveDropdown(null)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-white hover:bg-[#32332E] border-b border-[#40423A] flex items-center"><InfoIcon className="w-3.5 h-3.5 mr-2" /> View Details</button>
                            <button onClick={() => setActiveDropdown(null)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#E06C75] hover:bg-[#32332E] flex items-center"><Trash2Icon className="w-3.5 h-3.5 mr-2" /> Remove shortcut</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
