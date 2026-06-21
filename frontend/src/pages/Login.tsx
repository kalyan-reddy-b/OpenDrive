import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (!response.success || !response.data) {
        toast.error(response.message ?? 'Login failed. Check credentials.');
        return;
      }

      const { token, userId, username, email: userEmail, firstName, lastName, phone, bio, avatar } = response.data;

      setAuth(token, {
        id: userId,
        username: username,
        email: userEmail,
        firstName: firstName || username,
        lastName: lastName || '',
        phone: phone || '',
        bio: bio || '',
        avatar: avatar || '',
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Unable to sign in. Please verify your backend server is active.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5 font-sans text-[#201515]" onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold text-center mb-6">User Sign In</h3>

      <div>
        <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 pr-10 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-[#605D52] hover:text-[#FF4F00] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 border border-[#E8E5DF] rounded-[3px] accent-[#FF4F00]"
          />
          <span className="text-xs font-medium text-[#36342E]">Remember me</span>
        </label>
        
        <span className="text-xs font-medium text-[#FF4F00] hover:underline cursor-pointer">
          Forgot password?
        </span>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px] transition-colors"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="text-center text-xs pt-3.5 border-t border-[#E8E5DF]">
        <span className="text-[#605D52]">New to OpenDrive? </span>
        <Link to="/register" className="text-[#FF4F00] font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}
