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
  CloudIcon,
  LayoutDashboardIcon
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

  // Ping backend to wake it from cold-start sleep and fetch unread notifications on mount
  useEffect(() => {
    if (!token) return;
    pingBackend();
    notificationsApi.getUnread()
      .then(res => setNotifications(res.data ?? []))
      .catch(() => {/* non-critical fallback */});
  }, [token]);

  // Handle outside clicks to close notification panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Redirect to login if user is not authenticated
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
      setNotifications([]);
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
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboardIcon },
    { name: 'My Drive', path: '/drive', icon: FolderIcon },
    { name: 'Recent Files', path: '/recent', icon: ClockIcon },
    { name: 'Favorites', path: '/favorites', icon: StarIcon },
    { name: 'Shared with me', path: '/shared', icon: UsersIcon },
    { name: 'Trash', path: '/trash', icon: Trash2Icon },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-[#FFFEFB] text-[#201515] overflow-hidden font-sans">
      {/* ── Sidebar ── */}
      {isSidebarOpen && (
        <aside className="w-64 bg-[#F7F5F2] border-r border-[#E8E5DF] flex flex-col pt-6 pb-6 shrink-0 z-20">
          {/* Logo Title */}
          <div className="px-5 mb-8 flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-[#FF4F00] text-white rounded-[4px]">
              <CloudIcon className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[#201515] select-none">
              Open<span className="text-[#FF4F00]">Drive</span>
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
            <p className="px-3 text-[10px] font-semibold text-[#605D52] uppercase tracking-wider mb-2">Main Menu</p>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-xs font-medium rounded-[4px] transition-all border ${
                    isActive
                      ? 'bg-[#FF4F00] text-white border-[#FF4F00]'
                      : 'text-[#36342E] hover:bg-white hover:text-[#201515] border-transparent'
                  }`
                }
              >
                <item.icon className="mr-2.5 flex-shrink-0 h-4.5 w-4.5" />
                <span className="uppercase tracking-wider font-semibold">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Profile Section at Bottom */}
          <div className="px-3 mt-auto pt-4 border-t border-[#E8E5DF]">
            <div className="bg-white border border-[#E8E5DF] rounded-[6px] p-3 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                {/* Avatar Box */}
                <div className="h-9 w-9 bg-[#FF4F00]/10 border border-[#FF4F00]/20 rounded-[4px] flex items-center justify-center text-[#FF4F00] text-sm font-bold shrink-0">
                  {user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold text-[#201515] truncate">
                    {user?.firstName ? `${user.firstName} ${user.lastName}`.trim() : user?.username}
                  </p>
                  <p className="text-[10px] text-[#605D52] truncate font-medium">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-1.5 border border-[#E8E5DF] rounded-[4px] bg-white hover:bg-[#F7F5F2] font-semibold text-[10px] uppercase tracking-wider transition-colors text-[#201515]"
              >
                <span className="flex items-center justify-center gap-1">
                  <LogOutIcon className="h-3.5 w-3.5" />
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── Main Content Container ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Header Topnav */}
        <header className="h-16 bg-[#FFFEFB] border-b border-[#E8E5DF] flex items-center justify-between px-6 z-10 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] rounded-[4px] transition-all"
            title="Toggle Menu"
          >
            <MenuIcon className="h-4.5 w-4.5 text-[#201515]" />
          </button>

          {/* User Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] rounded-[4px] transition-all relative"
              title="Notifications"
            >
              <BellIcon className="h-4.5 w-4.5 text-[#201515]" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#FF4F00] ring-1 ring-white"></span>
              )}
            </button>

            {/* Zapier-style notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-10 mt-2 w-72 bg-white border border-[#E8E5DF] rounded-[6px] shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#E8E5DF] flex justify-between items-center bg-[#F7F5F2]">
                  <h3 className="text-xs font-semibold text-[#201515] uppercase tracking-wider">Notifications</h3>
                  {notifications.length > 0 && (
                    <span className="text-[9px] font-bold bg-[#FF4F00] text-white px-1.5 py-0.5 rounded-[3px]">{notifications.length} NEW</span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#E8E5DF]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#605D52] text-xs">
                      All caught up! No notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 bg-white hover:bg-[#F7F5F2] cursor-pointer transition-colors"
                        onClick={() => markOneAsRead(notif.id)}
                      >
                        <p className="text-[10px] font-semibold text-[#FF4F00] uppercase tracking-wider">{notif.title || 'System Alert'}</p>
                        <p className="text-xs text-[#201515] font-medium mt-0.5 leading-snug">{notif.message}</p>
                        <p className="text-[9px] text-[#605D52] mt-1.5 font-mono">{formatNotifTime(notif.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-[#E8E5DF] text-center bg-[#F7F5F2]">
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-semibold uppercase tracking-wider text-[#FF4F00] hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#FFFEFB]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
