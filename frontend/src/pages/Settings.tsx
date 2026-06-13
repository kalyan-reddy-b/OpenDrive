import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { CreditCardIcon, HardDriveIcon, BellIcon, ShieldIcon, UserIcon, CheckCircle2Icon, Save, AlertCircle, Edit2, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    username: user?.username || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security State
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'storage', name: 'Storage', icon: HardDriveIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldIcon },
  ];

  // Profile Handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = () => {
    if (!profileData.firstName || !profileData.lastName) {
      toast.error('First and last name are required');
      return;
    }

    setIsSavingProfile(true);
    setTimeout(() => {
      updateUser({
        ...user!,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
      });
      setIsSavingProfile(false);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    }, 800);
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      username: user?.username || '',
    });
    setIsEditingProfile(false);
  };

  // Password Handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.new.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.current === passwordData.new) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      toast.success('Password updated successfully');
    }, 1000);
  };

  const handleEnable2FA = () => {
    setIs2FAVerifying(true);
    setTimeout(() => {
      setIs2FAVerifying(false);
      setIs2FAEnabled(true);
      toast.success('Two-factor authentication enabled');
    }, 1000);
  };

  const handleDisable2FA = () => {
    setIs2FAEnabled(false);
    toast.success('Two-factor authentication disabled');
  };

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-mono">Settings</h1>
        <p className="text-[#A1A6B4] text-sm mt-1 font-mono">Manage your account and preferences</p>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#40423A] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium font-mono border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#61AFEF] text-[#61AFEF]'
                : 'border-transparent text-[#A1A6B4] hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-3xl">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-[#252622] border border-[#40423A] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white font-mono">Profile Information</h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 text-[#61AFEF] hover:text-white text-sm font-mono font-bold transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="w-full bg-[#32332E] border border-[#40423A] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#61AFEF] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="w-full bg-[#32332E] border border-[#40423A] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#61AFEF] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled
                      className="w-full bg-[#32332E] border border-[#40423A] rounded px-3 py-2 text-[#A1A6B4] text-sm font-mono cursor-not-allowed"
                    />
                    <p className="text-xs text-[#8A8F98] mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full bg-[#32332E] border border-[#40423A] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#61AFEF] transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="w-full bg-[#32332E] border border-[#40423A] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#61AFEF] transition-colors"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="inline-flex items-center gap-2 bg-[#61AFEF] hover:bg-[#5294CB] text-[#252622] font-bold text-sm px-4 py-2 rounded transition-all disabled:opacity-50 font-mono"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 bg-[#32332E] hover:bg-[#40423A] text-white font-bold text-sm px-4 py-2 rounded transition-all font-mono"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">First Name</label>
                      <p className="text-white font-mono">{user?.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Last Name</label>
                      <p className="text-white font-mono">{user?.lastName || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Email Address</label>
                    <p className="text-white font-mono">{user?.email || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Phone</label>
                    <p className="text-white font-mono">{user?.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Bio</label>
                    <p className="text-white font-mono">{user?.bio || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Member Since</label>
                    <p className="text-white font-mono">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-[#252622] border border-[#E06C75] border-opacity-30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-[#E06C75]" />
                <h3 className="text-sm font-bold text-[#E06C75] font-mono">Danger Zone</h3>
              </div>
              <p className="text-[#A1A6B4] text-xs mb-3 font-mono">Deleting your account is permanent and cannot be undone.</p>
              <button className="text-xs font-bold px-3 py-1.5 rounded border border-[#E06C75] text-[#E06C75] hover:bg-[#E06C75] hover:text-white transition-all font-mono">
                Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="bg-[#252622] border border-[#61AFEF] border-opacity-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono mb-1">Pro Tier</h3>
                  <p className="text-[#A1A6B4] text-sm font-mono">$15.00 / month</p>
                </div>
                <span className="bg-[#61AFEF] text-[#252622] text-xs font-bold px-2 py-1 rounded">ACTIVE</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm text-[#A1A6B4] font-mono">
                <li className="flex items-center"><CheckCircle2Icon className="w-4 h-4 text-[#98C379] mr-2 flex-shrink-0" /> 100 GB Secure Storage</li>
                <li className="flex items-center"><CheckCircle2Icon className="w-4 h-4 text-[#98C379] mr-2 flex-shrink-0" /> Advanced Sharing Controls</li>
                <li className="flex items-center"><CheckCircle2Icon className="w-4 h-4 text-[#98C379] mr-2 flex-shrink-0" /> Priority Support</li>
              </ul>
              <button className="text-xs font-bold px-4 py-2 rounded bg-[#32332E] hover:bg-[#40423A] text-[#61AFEF] transition-all font-mono">
                Manage via Stripe
              </button>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="bg-[#252622] border border-[#40423A] rounded-lg p-6">
            <h2 className="text-lg font-bold text-white font-mono mb-4">Storage Usage</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-[#A1A6B4]">Used: 45 GB</span>
                  <span className="text-white font-bold">Total: 100 GB (45%)</span>
                </div>
                <div className="w-full bg-[#32332E] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#61AFEF] h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <button className="text-xs font-bold px-4 py-2 rounded bg-[#32332E] hover:bg-[#40423A] text-[#98C379] transition-all font-mono mt-4">
                Upgrade Storage
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-[#252622] border border-[#40423A] rounded-lg p-6">
            <h2 className="text-lg font-bold text-white font-mono mb-4">Notification Preferences</h2>
            <div className="space-y-2">
              {[
                { label: 'Email alerts for file shares', defaultChecked: true },
                { label: 'Security alerts (New logins)', defaultChecked: true },
                { label: 'Storage alerts', defaultChecked: true },
                { label: 'Marketing and product updates', defaultChecked: false },
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-3 p-3 rounded bg-[#32332E] hover:bg-[#40423A] cursor-pointer transition-all">
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 rounded bg-[#252622] border border-[#40423A] accent-[#61AFEF]" />
                  <span className="text-sm text-white font-mono">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            {/* Change Password */}
            <div className="bg-[#252622] border border-[#40423A] rounded-lg p-6">
              <h2 className="text-lg font-bold text-white font-mono mb-4">Change Password</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="current"
                      value={passwordData.current}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#32332E] border border-[#40423A] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#61AFEF] transition-colors pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-2.5 text-[#A1A6B4] hover:text-white"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="new"
                      value={passwordData.new}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#32332E] border border-[#40423A] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#61AFEF] transition-colors pr-10"
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-2.5 text-[#A1A6B4] hover:text-white"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A1A6B4] uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirm"
                      value={passwordData.confirm}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#32332E] border border-[#40423A] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#61AFEF] transition-colors pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-2.5 text-[#A1A6B4] hover:text-white"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={isChangingPassword}
                  className="text-xs font-bold px-4 py-2 rounded bg-[#61AFEF] hover:bg-[#5294CB] text-[#252622] transition-all font-mono disabled:opacity-50 mt-2"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-[#252622] border border-[#40423A] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white font-mono mb-1">Two-Factor Authentication</h2>
                  <p className="text-xs text-[#A1A6B4] font-mono">Add an extra layer of security to your account</p>
                </div>
                {is2FAEnabled && <CheckCircle2Icon className="w-5 h-5 text-[#98C379]" />}
              </div>
              <div className="mt-4">
                {is2FAEnabled ? (
                  <button
                    onClick={handleDisable2FA}
                    className="text-xs font-bold px-4 py-2 rounded bg-[#E06C75] hover:bg-[#D85A65] text-white transition-all font-mono"
                  >
                    Disable 2FA
                  </button>
                ) : (
                  <button
                    onClick={handleEnable2FA}
                    disabled={is2FAVerifying}
                    className="text-xs font-bold px-4 py-2 rounded bg-[#32332E] hover:bg-[#40423A] text-[#61AFEF] transition-all font-mono disabled:opacity-50"
                  >
                    {is2FAVerifying ? 'Enabling...' : 'Enable 2FA'}
                  </button>
                )}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-[#252622] border border-[#40423A] rounded-lg p-6">
              <h2 className="text-lg font-bold text-white font-mono mb-4">Active Sessions</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#32332E] rounded border border-[#40423A]">
                  <div>
                    <p className="text-sm font-bold text-white font-mono">Current Session</p>
                    <p className="text-xs text-[#A1A6B4] font-mono">Last active now</p>
                  </div>
                  <span className="text-xs font-bold text-[#98C379] font-mono">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
