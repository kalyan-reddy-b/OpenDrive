import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/authApi';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Register the account
      const registerRes = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (!registerRes.success) {
        toast.error(registerRes.message ?? 'Registration failed');
        return;
      }

      // Immediately log in to get the JWT token
      const loginRes = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      if (!loginRes.success || !loginRes.data) {
        toast.success('Account created! Please sign in.');
        navigate('/login');
        return;
      }

      const { token, userId, username, email: userEmail } = loginRes.data;

      setAuth(token, {
        id: userId,
        username: username,
        email: userEmail,
        firstName: formData.firstName || username,
        lastName: formData.lastName,
        phone: formData.phone,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      toast.success('Account created successfully!');
      navigate('/drive');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#A1A6B4] font-mono uppercase tracking-wider mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white p-3 font-mono text-sm focus:outline-none focus:border-[#61AFEF] transition-colors"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#A1A6B4] font-mono uppercase tracking-wider mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white p-3 font-mono text-sm focus:outline-none focus:border-[#61AFEF] transition-colors"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#A1A6B4] font-mono uppercase tracking-wider mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white p-3 font-mono text-sm focus:outline-none focus:border-[#61AFEF] transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#A1A6B4] font-mono uppercase tracking-wider mb-2">
          Phone (Optional)
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white p-3 font-mono text-sm focus:outline-none focus:border-[#61AFEF] transition-colors"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#A1A6B4] font-mono uppercase tracking-wider mb-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          required
          value={formData.username}
          onChange={handleChange}
          className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white p-3 font-mono text-sm focus:outline-none focus:border-[#61AFEF] transition-colors"
          placeholder="johndoe"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#A1A6B4] font-mono uppercase tracking-wider mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.password ? 'text' : 'password'}
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white p-3 pr-10 font-mono text-sm focus:outline-none focus:border-[#61AFEF] transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, password: !showPasswords.password })}
            className="absolute right-3 top-3 text-[#A1A6B4] hover:text-white transition-colors"
          >
            {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-[#8A8F98] mt-1 font-mono">Min 8 characters</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#A1A6B4] font-mono uppercase tracking-wider mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full bg-[#32332E] border border-[#40423A] rounded-md text-white p-3 pr-10 font-mono text-sm focus:outline-none focus:border-[#61AFEF] transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, confirmPassword: !showPasswords.confirmPassword })}
            className="absolute right-3 top-3 text-[#A1A6B4] hover:text-white transition-colors"
          >
            {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 bg-[#61AFEF] hover:bg-[#5294CB] text-[#252622] font-mono text-sm font-bold rounded-md transition-all disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-[#A1A6B4] font-mono">Already have an account? </span>
        <Link to="/login" className="font-bold text-[#61AFEF] hover:text-white font-mono transition-colors">
          Sign in here
        </Link>
      </div>
    </form>
  );
}
