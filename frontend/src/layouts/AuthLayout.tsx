import { Outlet, Navigate } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import { CloudIcon } from 'lucide-react';

export default function AuthLayout() {
  const { token } = useAuthStore();

  // If already authenticated, redirect directly to the drive page
  if (token) {
    return <Navigate to="/drive" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FFFEFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        {/* Logo block */}
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FF4F00] text-white rounded-[4px] mb-3">
          <CloudIcon className="w-7 h-7" />
        </div>
        <h2 className="text-center text-3xl font-semibold text-[#201515] tracking-tight">
          Open<span className="text-[#FF4F00]">Drive</span>
        </h2>
        <div className="mt-2 inline-block">
          <span className="badge-sticker text-xs">Cloud Storage Workspace</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main form container card */}
        <div className="bg-[#F7F5F2] py-8 px-6 sm:px-10 border border-[#E8E5DF] rounded-[8px] shadow-sm relative overflow-hidden">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#FF4F00]"></div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
