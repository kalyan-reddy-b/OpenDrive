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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#252622] border border-[#40423A] rounded-lg shadow-2xl w-96 max-w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#40423A]">
          <h2 className="text-lg font-bold text-white font-mono">Rename File</h2>
          <button 
            onClick={handleCancel}
            className="text-[#A1A6B4] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#A1A6B4] mb-2 font-mono">Current name</label>
            <input 
              type="text" 
              value={currentName}
              disabled
              className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-[#A1A6B4] px-3 py-2 text-sm font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#A1A6B4] mb-2 font-mono">New name</label>
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
              className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#61AFEF] transition-colors"
              placeholder="Enter new file name"
            />
          </div>

          {error && (
            <p className="text-sm text-[#E06C75] font-mono">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#40423A] flex justify-end gap-3">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-bold rounded-md bg-[#32332E] text-[#A1A6B4] hover:bg-[#40423A] hover:text-white transition-colors font-mono"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-bold rounded-md bg-[#61AFEF] text-[#252622] hover:bg-[#5294CB] transition-colors font-mono"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}
