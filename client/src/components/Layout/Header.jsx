/**
 * @file components/Layout/Header.jsx
 * @description Application header with navigation links and authentication status.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Custom hook for authentication context
import Button from '../Common/Button'; // Reusable Button component

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth(); // Get auth state and functions
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout function from AuthContext
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <Link to="/dashboard" className="text-2xl font-bold text-blue-300 hover:text-blue-200 transition-colors duration-200">
          QuickDesk
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="flex space-x-6 items-center">
            {isAuthenticated ? (
              <>
                {/* Links for authenticated users */}
                <li>
                  <Link to="/dashboard" className="hover:text-blue-300 transition-colors duration-200">Dashboard</Link>
                </li>
                <li>
                  <Link to="/tickets/new" className="hover:text-blue-300 transition-colors duration-200">New Ticket</Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-blue-300 transition-colors duration-200">Profile</Link>
                </li>
                {/* Admin specific links */}
                {user && user.role === 'admin' && (
                  <>
                    <li>
                      <Link to="/admin/users" className="hover:text-blue-300 transition-colors duration-200">Users</Link>
                    </li>
                    <li>
                      <Link to="/admin/categories" className="hover:text-blue-300 transition-colors duration-200">Categories</Link>
                    </li>
                  </>
                )}
                {/* User info and Logout button */}
                <li className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm">{user?.username} ({user?.role})</span>
                  <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm">
                    Logout
                  </Button>
                </li>
              </>
            ) : (
              <>
                {/* Links for unauthenticated users */}
                <li>
                  <Link to="/login" className="hover:text-blue-300 transition-colors duration-200">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-blue-300 transition-colors duration-200">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;