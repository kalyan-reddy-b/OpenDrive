import { Outlet, Navigate } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import { CloudIcon } from 'lucide-react';

export default function AuthLayout() {
  const { token } = useAuthStore();

  if (token) {
    return <Navigate to="/drive" replace />;
  }

  return (
    <div className="min-h-screen bg-[#32332E] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <CloudIcon className="w-16 h-16 text-[#61AFEF] mx-auto mb-4" />
        <h2 className="text-center text-3xl font-extrabold text-white font-mono">
          OpenDrive
        </h2>
        <p className="mt-2 text-center text-sm text-[#A1A6B4] font-mono">
          Enterprise Cloud Storage
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#252622] py-8 px-4 shadow-2xl border border-[#40423A] rounded-xl sm:px-10 relative overflow-hidden">
          {/* Subtle accent border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#61AFEF]"></div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
