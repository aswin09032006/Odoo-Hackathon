/**
 * @file components/Layout/Sidebar.jsx
 * @description Collapsible sidebar navigation component for the application.
 */
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWindowSize } from '../../hooks/useWindowSize';
import Button from '../Common/Button';
import NavigationLinks from './NavigationLinks';

const Sidebar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { width } = useWindowSize();

  // Automatically collapse sidebar on screens smaller than 1024px (Tailwind's 'lg' breakpoint)
  const [isCollapsed, setIsCollapsed] = useState(width < 1024);

  // Effect to handle resizing
  useEffect(() => {
    if (width < 1024) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [width]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={clsx(
      'bg-white text-gray-800 flex h-screen flex-col transition-all duration-300 ease-in-out z-40 flex-shrink-0 border-r border-gray-200',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Top Section: Logo & Toggle */}
      <div className="flex items-center justify-between px-4 border-b border-gray-200 h-20">
        {!isCollapsed && (
          <Link to="/dashboard" className="text-xl font-medium text-[#504ee2] hover:text-[#6a66e7]">
            QuickDesk
          </Link>
        )}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-transparent hover:bg-gray-100 text-gray-700 p-2 rounded-full"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-6 overflow-y-auto overflow-x-hidden px-2 pb-4">
        <NavigationLinks isCollapsed={isCollapsed} />
      </nav>

      {/* User Info & Logout (at bottom) */}
      {isAuthenticated && (
        <div className="px-4 py-4 border-t border-gray-200 mt-auto">
          <div className={clsx(
            "flex items-center w-full",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <div className="flex items-center">
                <User size={20} className="mr-3 text-gray-600" />
                <div className="flex flex-col text-sm">
                  <p className="font-medium text-gray-700">{user?.username}</p>
                  <p className="text-xs text-gray-600 capitalize">({user?.role})</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-full text-gray-600 hover:bg-red-100 hover:text-red-700"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;