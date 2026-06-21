import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { CreditCardIcon, HardDriveIcon, BellIcon, ShieldIcon, UserIcon, CheckCircle2Icon, Save, AlertCircle, Edit2, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi } from '../api/usersApi';

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

  // ─── Profile Submit ────────────────────────────────────────────────────────
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    if (!profileData.firstName || !profileData.lastName) {
      toast.error('First and last name are required');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await usersApi.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        bio: profileData.bio,
      });

      if (res.success && res.data) {
        updateUser({
          ...user!,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          phone: res.data.phone,
          bio: res.data.bio,
        });
        setIsEditingProfile(false);
        toast.success('Profile synced with database successfully');
      } else {
        toast.error(res.message ?? 'Failed to update profile');
      }
    } catch {
      toast.error('Error connecting to user API');
    } finally {
      setIsSavingProfile(false);
    }
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

  // ─── Password Change Submit ─────────────────────────────────────────────────
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePassword = async () => {
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
    try {
      const res = await usersApi.changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });

      if (res.success) {
        setPasswordData({ current: '', new: '', confirm: '' });
        toast.success('Password updated in database successfully');
      } else {
        toast.error(res.message ?? 'Incorrect current password');
      }
    } catch {
      toast.error('Error updating password. Try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = () => {
    setIs2FAVerifying(true);
    setTimeout(() => {
      setIs2FAVerifying(false);
      setIs2FAEnabled(true);
      toast.success('Two-factor authentication enabled');
    }, 800);
  };

  const handleDisable2FA = () => {
    setIs2FAEnabled(false);
    toast.success('Two-factor authentication disabled');
  };

  return (
    <div className="pb-12 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#201515] tracking-tight">Settings</h1>
        <p className="text-sm text-[#605D52] mt-1">Manage your user profile and account preferences</p>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex gap-2 border-b border-[#E8E5DF] pb-3 overflow-x-auto select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[4px] border transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#FF4F00] text-white border-[#FF4F00]'
                  : 'bg-white text-[#201515] border-[#E8E5DF] hover:bg-[#F7F5F2]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <div className="max-w-2xl">
        {activeTab === 'profile' && (
          <div className="space-y-5">
            {/* Profile Card */}
            <div className="bg-white border border-[#E8E5DF] rounded-[8px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-[#201515]">Profile Information</h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] text-xs font-semibold rounded-[4px] text-[#201515] transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#605D52] cursor-not-allowed"
                    />
                    <p className="text-[10px] text-[#605D52] mt-1">Email address is bound to your account node</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">Bio / Description</label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      rows={3}
                      className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="px-4 py-2.5 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px]"
                    >
                      <span className="flex items-center gap-1">
                        <Save className="w-3.5 h-3.5" />
                        {isSavingProfile ? 'Saving...' : 'Save Profile'}
                      </span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2.5 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] text-[#201515] text-xs font-semibold rounded-[4px]"
                    >
                      <span className="flex items-center gap-1">
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs font-semibold text-[#201515]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-[#605D52] uppercase tracking-wider mb-1">First Name</label>
                      <p className="text-sm font-medium">{user?.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#605D52] uppercase tracking-wider mb-1">Last Name</label>
                      <p className="text-sm font-medium">{user?.lastName || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#605D52] uppercase tracking-wider mb-1">Email Address</label>
                    <p className="text-sm font-medium">{user?.email || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#605D52] uppercase tracking-wider mb-1">Phone</label>
                    <p className="text-sm font-medium">{user?.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#605D52] uppercase tracking-wider mb-1">Bio</label>
                    <p className="text-sm font-medium whitespace-pre-wrap">{user?.bio || 'No bio provided'}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#605D52] uppercase tracking-wider mb-1">Username</label>
                    <p className="text-sm font-semibold text-[#FF4F00]">{user?.username || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-200 rounded-[8px] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-semibold text-red-600">Danger Zone</h3>
              </div>
              <p className="text-[#605D52] text-xs mb-4">Deleting your account is permanent and cannot be undone.</p>
              <button 
                onClick={() => toast.error('Account deletion requires contacting support.')}
                className="px-4 py-2 border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs font-semibold rounded-[4px] transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E8E5DF] rounded-[8px] p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-[#201515] mb-1">Pro Cloud Tier</h3>
                  <p className="text-sm text-[#FF4F00] font-semibold">$15.00 / month</p>
                </div>
                <span className="bg-[#FF4F00]/10 text-[#FF4F00] border border-[#FF4F00]/20 text-[10px] font-bold px-2.5 py-1 rounded-[4px]">ACTIVE</span>
              </div>
              <ul className="space-y-2.5 mb-6 text-xs text-[#36342E]">
                <li className="flex items-center"><CheckCircle2Icon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /> 100 GB Secure Storage</li>
                <li className="flex items-center"><CheckCircle2Icon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /> Advanced Sharing Controls</li>
                <li className="flex items-center"><CheckCircle2Icon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /> Priority Support</li>
              </ul>
              <button 
                onClick={() => toast.info('Billing portals are simulation only')}
                className="px-4 py-2.5 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px]"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="bg-white border border-[#E8E5DF] rounded-[8px] p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#201515] mb-4">Storage Quota</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-[#605D52]">Quota Status</span>
                  <span className="text-[#201515]">100 GB total</span>
                </div>
                <div className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-full h-4 overflow-hidden relative flex items-center justify-center">
                  <div className="absolute left-0 top-0 bg-[#FF4F00] h-full" style={{ width: '0.2%' }}></div>
                </div>
                <p className="text-[10px] text-[#605D52] mt-1.5 font-mono">0.2% USED (204.8 MB)</p>
              </div>
              <button 
                onClick={() => toast.info('Storage upgrades are simulation only')}
                className="px-4 py-2.5 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px] mt-2"
              >
                Upgrade Storage Nodes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white border border-[#E8E5DF] rounded-[8px] p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#201515] mb-4">Notification Preferences</h2>
            <div className="space-y-2.5">
              {[
                { label: 'Email alerts for file shares', defaultChecked: true },
                { label: 'Security alerts (New logins)', defaultChecked: true },
                { label: 'Storage threshold alerts', defaultChecked: true },
                { label: 'Marketing updates', defaultChecked: false },
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-3 p-3.5 bg-[#F7F5F2] border border-[#E8E5DF] hover:bg-white rounded-[6px] cursor-pointer transition-all">
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 border border-[#E8E5DF] bg-white text-[#FF4F00] focus:ring-0 rounded-[3px] accent-[#FF4F00]" />
                  <span className="text-xs text-[#201515] font-semibold">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-5">
            {/* Change Password */}
            <div className="bg-white border border-[#E8E5DF] rounded-[8px] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#201515] mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="current"
                      value={passwordData.current}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00] pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-3 text-[#605D52] hover:text-[#FF4F00]"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="new"
                      value={passwordData.new}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00] pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-3 text-[#605D52] hover:text-[#FF4F00]"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#36342E] uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirm"
                      value={passwordData.confirm}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-[6px] p-2.5 text-xs text-[#201515] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4F00] pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-3 text-[#605D52] hover:text-[#FF4F00]"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={isChangingPassword}
                  className="px-4 py-2.5 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px] transition-colors"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white border border-[#E8E5DF] rounded-[8px] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#201515] mb-1">Two-Factor Authentication</h2>
                  <p className="text-xs text-[#605D52]">Add an extra layer of security to your authentication node</p>
                </div>
                {is2FAEnabled && <CheckCircle2Icon className="w-5 h-5 text-green-500 shrink-0" />}
              </div>
              <div className="mt-4">
                {is2FAEnabled ? (
                  <button
                    onClick={handleDisable2FA}
                    className="px-4 py-2 border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs font-semibold rounded-[4px] transition-all"
                  >
                    Disable 2FA
                  </button>
                ) : (
                  <button
                    onClick={handleEnable2FA}
                    disabled={is2FAVerifying}
                    className="px-4 py-2.5 bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-semibold rounded-[4px]"
                  >
                    {is2FAVerifying ? 'Enabling...' : 'Enable 2FA'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
