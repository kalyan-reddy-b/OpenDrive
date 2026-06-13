import { Outlet, NavLink, useNavigate, Navigate } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import {
  FolderIcon,
  StarIcon,
  ClockIcon,
  UsersIcon,
  Trash2Icon,
  LogOutIcon,
  BellIcon,
  SettingsIcon,
  MenuIcon,
  CloudIcon
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { notificationsApi, type NotificationDto } from '../api/notificationsApi';
import { pingBackend } from '../api/healthApi';

export default function DashboardLayout() {
  const { user, logout, token } = useAuthStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  // Ping backend on mount to wake Render free-tier from sleep, and fetch unread notifications
  useEffect(() => {
    if (!token) return;
    pingBackend();
    notificationsApi.getUnread()
      .then(res => setNotifications(res.data ?? []))
      .catch(() => {/* non-critical — silently skip */});
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Guard: redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications([]);
    } catch {
      setNotifications([]); // optimistic even on failure
    }
    setShowNotifications(false);
  };

  const markOneAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const formatNotifTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diff = (Date.now() - date.getTime()) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return dateStr;
    }
  };

  const navItems = [
    { name: 'My Drive', path: '/drive', icon: FolderIcon },
    { name: 'Recent Files', path: '/recent', icon: ClockIcon },
    { name: 'Favorites', path: '/favorites', icon: StarIcon },
    { name: 'Shared with me', path: '/shared', icon: UsersIcon },
    { name: 'Trash', path: '/trash', icon: Trash2Icon },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-[#F2F2F2] overflow-hidden">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-64 bg-[#252622] border-r border-[#40423A] flex flex-col pt-6 pb-4 shadow-xl z-20 shrink-0">
          <div className="px-6 mb-10 flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-[#61AFEF] rounded-lg">
              <CloudIcon className="w-5 h-5 text-[#252622]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-mono text-white">OpenDrive</h1>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <p className="px-3 text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-3 mt-4 font-mono">Main Menu</p>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#40423A] text-white'
                      : 'text-[#A1A6B4] hover:bg-[#32332E] hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 flex-shrink-0 h-4 w-4" />
                <span className="font-mono">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Profile Section */}
          <div className="px-4 mt-auto pt-6 border-t border-[#40423A]">
            <div className="bg-[#32332E] rounded-md border border-[#40423A] p-3 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-[#252622] border border-[#40423A] rounded-full flex items-center justify-center text-white font-mono text-sm font-bold shadow-sm">
                  {user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-white font-mono truncate">
                    {user?.firstName ? `${user.firstName} ${user.lastName}`.trim() : user?.username}
                  </p>
                  <p className="text-xs text-[#8A8F98] truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-3 py-1.5 rounded-md text-xs font-bold text-[#A1A6B4] bg-[#252622] border border-[#40423A] hover:bg-[#40423A] hover:text-white transition-colors uppercase tracking-wider"
              >
                <LogOutIcon className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#1a1a1a]">
        {/* Header */}
        <header className="h-14 bg-[#252622] border-b border-[#40423A] flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-[#A1A6B4] hover:text-white hover:bg-[#40423A] rounded-md transition-colors flex items-center justify-center"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="ml-4 flex items-center relative gap-4" ref={notificationRef}>
            <button
              className="p-1.5 text-[#A1A6B4] hover:text-white hover:bg-[#40423A] rounded-md transition-colors relative flex items-center justify-center"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BellIcon className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E06C75] text-[10px] font-bold text-white shadow-sm font-sans">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-10 mt-2 w-80 bg-[#252622] rounded-md border border-[#40423A] shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-[#40423A] flex justify-between items-center bg-[#32332E] rounded-t-md">
                  <h3 className="text-sm font-bold font-mono text-white">Notifications</h3>
                  {notifications.length > 0 && (
                    <span className="text-xs font-bold text-[#E06C75]">{notifications.length} new</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#A1A6B4] text-sm font-mono">
                      All caught up.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border-b border-[#40423A] hover:bg-[#32332E] cursor-pointer"
                        onClick={() => markOneAsRead(notif.id)}
                      >
                        <p className="text-sm font-bold text-white font-mono">{notif.title || 'Notification'}</p>
                        <p className="text-xs text-[#A1A6B4] mt-1">{notif.message}</p>
                        <p className="text-xs text-[#8A8F98] mt-2 font-mono">{formatNotifTime(notif.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-[#40423A] text-center bg-[#32332E] rounded-b-md">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-[#61AFEF] hover:text-white font-mono transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main section */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
