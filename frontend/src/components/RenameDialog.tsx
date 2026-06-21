import { useState } from 'react';
import { X } from 'lucide-react';

interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

export default function RenameDialog({ isOpen, currentName, onConfirm, onCancel }: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('File name cannot be empty');
      return;
    }
    if (trimmed === currentName) {
      setError('New name must be different');
      return;
    }
    if (trimmed.length > 255) {
      setError('File name is too long');
      return;
    }
    onConfirm(trimmed);
    setNewName(currentName);
    setError('');
  };

  const handleCancel = () => {
    setNewName(currentName);
    setError('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white border border-[#E8E5DF] rounded-[8px] shadow-xl w-96 max-w-full relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5DF]">
          <h2 className="text-base font-semibold text-[#201515]">Rename File</h2>
          <button 
            onClick={handleCancel}
            className="text-[#605D52] hover:text-[#201515] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">Current name</label>
            <input 
              type="text" 
              value={currentName}
              disabled
              className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] text-[#605D52] px-3 py-2 text-xs cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">New name</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
                if (e.key === 'Escape') handleCancel();
              }}
              autoFocus
              className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] text-[#201515] px-3 py-2 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00] transition-all"
              placeholder="Enter new file name"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-semibold">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E8E5DF] flex justify-end gap-2.5">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-semibold rounded-[4px] bg-white border border-[#E8E5DF] text-[#201515] hover:bg-[#F7F5F2] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold rounded-[4px] bg-[#FF4F00] hover:bg-[#e04500] text-white transition-colors"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}
