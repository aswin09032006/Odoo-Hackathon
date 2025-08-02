/**
 * @file components/Layout/Sidebar.jsx
 * @description Collapsible sidebar navigation component for the application.
 *              Replaces the old Header.jsx component.
 */

import clsx from 'clsx';
import {
    ChevronLeft, ChevronRight,
    LayoutDashboard,
    LogIn, LogOut,
    Tags,
    TicketPlus, User,
    UserPlus,
    Users
} from 'lucide-react'; // Import all necessary icons
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button'; // Assuming this button component is also minimalistic

// Define navigation items with their properties
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, authRequired: true },
  { name: 'New Ticket', path: '/tickets/new', icon: TicketPlus, authRequired: true },
  { name: 'Profile', path: '/profile', icon: User, authRequired: true },
  // Admin links - will be conditionally rendered based on user role
  { name: 'User Management', path: '/admin/users', icon: Users, role: 'admin' },
  { name: 'Category Management', path: '/admin/categories', icon: Tags, role: 'admin' },
  // Public links - for unauthenticated users
  { name: 'Login', path: '/login', icon: LogIn, authRequired: false, alwaysShowWhenLoggedOut: true },
  { name: 'Register', path: '/register', icon: UserPlus, authRequired: false, alwaysShowWhenLoggedOut: true },
];

const Sidebar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // To get current path for active link styling
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout(); // Call logout function from AuthContext
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <aside className={clsx(
      'bg-white text-gray-800 flex h-screen flex-col transition-all duration-300 ease-in-out z-40 flex-shrink-0 border-r border-gray-200',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Top Section: Logo & Toggle */}
      <div className="flex items-center justify-between px-4 border-b border-gray-200 h-20">
        {!isCollapsed && (
          <Link to="/dashboard" className="text-xl font-medium text-[#504ee2] hover:text-[#6a66e7] transition-colors duration-200">
            QuickDesk
          </Link>
        )}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-transparent hover:bg-gray-100 text-gray-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#504ee2] focus:ring-offset-2 focus:ring-offset-white"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-6 overflow-y-auto overflow-x-hidden px-2 pb-4">
        <ul className="space-y-1">
          {navItems.map(item => {
            const showLink = isAuthenticated
                ? (item.authRequired && (!item.role || user?.role === item.role)) // Logic for authenticated users
                : (!item.authRequired && item.alwaysShowWhenLoggedOut); // Logic for unauthenticated users

            if (!showLink) return null;

            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={clsx(
                    'flex items-center py-2 px-3 rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-[#504ee2] text-white'
                      : 'hover:bg-[#5f5ceb] hover:text-white text-gray-700'
                  )}
                >
                  <Icon size={18} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
                  {!isCollapsed && <span className="text-sm font-normal">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout (at bottom) */}
      {isAuthenticated && (
        <div className={clsx(
          "px-4 py-4 border-t border-gray-200 mt-auto flex",
          isCollapsed ? "flex-col items-center" : "flex-col items-start"
        )}>
          {/* Main User Info Line: Icon + Name/Role (conditionally) + Logout Icon (always visible) */}
          <div className={clsx(
            "flex items-center w-full",
            isCollapsed ? "justify-center gap-y-2 flex-col" : "justify-between"
          )}>
            {/* Group User Icon and Name/Role Text */}
            <div className={clsx("flex items-center", isCollapsed ? 'mb-2' : '')}>
              <User size={20} className={clsx(isCollapsed ? 'text-gray-500' : 'mr-3 text-gray-600')} />
              {!isCollapsed && (
                <div className="flex flex-col text-sm">
                  <p className="font-medium text-gray-700">{user?.username}</p>
                  <p className="text-xs text-gray-600 capitalize">({user?.role})</p>
                </div>
              )}
            </div>

            {/* Logout Icon (small button) */}
            <button
              onClick={handleLogout}
              title="Logout"
              className={clsx(
                "p-2 rounded-full",
                "text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white",
                isCollapsed ? "" : ""
              )}
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