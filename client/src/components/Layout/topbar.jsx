/**
 * @file components/Layout/Topbar.jsx
 * @description Top navigation bar for mobile screens.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import clsx from 'clsx';
import NavigationLinks from './NavigationLinks';

const Topbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 h-20 bg-white border-b border-gray-200 z-50 flex-shrink-0">
        {/* Left: Logo */}
        <Link to="/dashboard" className="text-xl font-medium text-[#504ee2]">
          QuickDesk
        </Link>

        {/* Right: Hamburger Menu Icon */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={clsx(
          "fixed inset-0 z-50 transition-opacity duration-300 ease-in-out",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div
          className={clsx(
            "relative flex flex-col h-full w-64 max-w-[80vw] bg-white transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 h-20">
            <span className="text-lg font-medium text-[#504ee2]">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <NavigationLinks onLinkClick={() => setIsMobileMenuOpen(false)} />
          </nav>
          
          {/* Footer with User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <UserIcon size={32} className="mr-3 p-1.5 bg-gray-100 rounded-full text-gray-600" />
              <div>
                <p className="font-medium text-sm text-gray-700">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-md text-red-600 bg-red-50 hover:bg-red-100"
            >
              <LogOut size={16} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Topbar;