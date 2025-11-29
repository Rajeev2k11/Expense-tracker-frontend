import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  ChevronDown,
  X,
  Shield // Admin icon ke liye
} from 'lucide-react';

const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const adminLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'Expenses', icon: CreditCard },
    { to: '/team', label: 'Team', icon: Users },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/admin', label: 'Admin Panel', icon: Shield },
  ];

  const memberLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'My Expenses', icon: CreditCard },
    { to: '/team', label: 'Team', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const links = isAdmin() ? adminLinks : memberLinks;

  const defaultAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='%23FFFFFF' font-family='Arial,Helvetica,sans-serif' font-size='16' font-weight='600'>${user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</text></svg>`
  )}`;

  const handleProfileClick = () => {
    navigate('/profile');
    setIsProfileOpen(false);
    onClose?.();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsProfileOpen(false);
    onClose?.();
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsProfileOpen(false);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    onClose?.();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0 overflow-y-auto">
      {/* Header - Sticky top */}
      <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ExpensePro</h1>
              <p className="text-xs text-gray-500">Expense Management</p>
            </div>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900 border-l-2 border-l-gray-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <IconComponent className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section - Sticky bottom */}
      <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img 
              src={user?.avatar || defaultAvatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-gray-300"
            />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <button 
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                My Profile
              </button>
              
              {/* Admin Link - Only show if user is admin */}
              {isAdmin() && (
                <button 
                  onClick={handleAdminClick}
                  className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
              
              <button 
                onClick={handleSettingsClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;