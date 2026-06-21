import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/authApi';
import { usersApi } from '../api/usersApi';

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
      // 1. Register account
      const registerRes = await authApi.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!registerRes.success) {
        toast.error(registerRes.message ?? 'Registration failed');
        return;
      }

      // 2. Automatically sign in
      const loginRes = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!loginRes.success || !loginRes.data) {
        toast.success('Account created! Please sign in.');
        navigate('/login');
        return;
      }

      const { token, userId, username, email: userEmail } = loginRes.data;

      // 3. Immediately push the firstName / lastName details to the profile DB
      try {
        await usersApi.updateProfile({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || undefined,
          bio: ''
        });
      } catch {
        // Skip non-critical profile initialisation error
      }

      setAuth(token, {
        id: userId,
        username: username,
        email: userEmail,
        firstName: formData.firstName.trim() || username,
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Verify connection to backend.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4 font-sans text-[#201515]" onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold text-center mb-6">Create Account</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">
          Phone (Optional)
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          required
          value={formData.username}
          onChange={handleChange}
          className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
          placeholder="johndoe"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.password ? 'text' : 'password'}
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 pr-10 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
            placeholder="Min 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, password: !showPasswords.password })}
            className="absolute right-3 top-2.5 text-[#605D52] hover:text-[#FF4F00]"
          >
            {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 pr-10 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
            placeholder="Re-enter password"
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, confirmPassword: !showPasswords.confirmPassword })}
            className="absolute right-3 top-2.5 text-[#605D52] hover:text-[#FF4F00]"
          >
            {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px] mt-2 transition-colors"
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>

      <div className="text-center text-xs pt-3.5 border-t border-[#E8E5DF]">
        <span className="text-[#605D52]">Already have an account? </span>
        <Link to="/login" className="text-[#FF4F00] font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
}
