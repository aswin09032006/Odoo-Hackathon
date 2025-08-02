// quickdesk/client/src/context/AuthContext.jsx

/**
 * @file context/AuthContext.jsx
 * @description React Context for managing global authentication state.
 *              Provides user info, authentication status, and login/logout functions.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api'; // Axios instance for API calls
import { toast } from 'react-toastify'; // For UI notifications

// FIX: Add 'export' here to make AuthContext a named export
export const AuthContext = createContext();

/**
 * AuthProvider component:
 * Manages the authentication state for the entire application.
 * It checks for an existing token on mount, provides login/logout functionality,
 * and makes the authentication state available to all consuming components.
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // True if user is logged in
  const [user, setUser] = useState(null); // Current logged-in user's data
  const [loading, setLoading] = useState(true); // Loading state for initial auth check

  // useEffect to run once on component mount to check for existing token
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Set default auth header for Axios instance
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Fetch user data from the backend to validate token
          const res = await api.get('/auth/me');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('AuthContext: Failed to load user profile.', error);
          // If token is invalid or expired, clear it and reset auth state
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false); // Set loading to false after initial check
    };

    loadUser();
  }, []); // Empty dependency array means this runs only once on mount

  /**
   * Logs in a user.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<Object>} Object with success status and optional message.
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token); // Store JWT
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`; // Set default header
      setUser(res.data);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${res.data.username}!`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      toast.error(message);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registers a new user.
   * @param {Object} userData - User registration data (username, email, password, optional role).
   * @returns {Promise<Object>} Object with success status and optional message.
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data);
      setIsAuthenticated(true);
      toast.success(`Account created successfully! Welcome, ${res.data.username}!`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
      toast.error(message);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs out the current user.
   * Clears local storage and resets authentication state.
   */
  const logout = () => {
    localStorage.removeItem('token'); // Remove JWT
    delete api.defaults.headers.common['Authorization']; // Remove auth header
    setIsAuthenticated(false);
    setUser(null);
    toast.info('You have been logged out.');
  };

  // Provide the authentication state and functions to children components
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};