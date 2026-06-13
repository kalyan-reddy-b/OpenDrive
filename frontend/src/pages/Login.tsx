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
        toast.error(response.message ?? 'Login failed. Please check your credentials.');
        return;
      }

      const { token, userId, username, email: userEmail } = response.data;

      setAuth(token, {
        id: userId,
        username: username,
        email: userEmail,
        firstName: username,
        lastName: '',
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      toast.success('Signed in successfully!');
      navigate('/drive');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Unable to sign in. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-bold text-[#A1A6B4] font-mono uppercase tracking-wider">
          Email address
        </label>
        <div className="mt-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white p-3 font-mono focus:outline-none focus:border-[#61AFEF] transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#A1A6B4] font-mono uppercase tracking-wider">
          Password
        </label>
        <div className="mt-2 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white p-3 pr-10 font-mono focus:outline-none focus:border-[#61AFEF] transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-[#A1A6B4] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 bg-[#32332E] border-[#40423A] rounded text-[#61AFEF] focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-[#A1A6B4] font-mono">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-bold text-[#61AFEF] hover:text-white font-mono transition-colors">
            Forgot password?
          </a>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 bg-[#40423A] border border-[#50524A] hover:bg-[#50524A] rounded-md text-white font-mono text-sm font-bold transition-all disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-[#A1A6B4] font-mono">Don't have an account? </span>
        <Link to="/register" className="font-bold text-[#61AFEF] hover:text-white font-mono transition-colors">
          Register here
        </Link>
      </div>
    </form>
  );
}
