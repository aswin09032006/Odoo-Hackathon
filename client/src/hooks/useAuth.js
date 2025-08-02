/**
 * @file hooks/useAuth.js
 * @description Custom React hook to consume the AuthContext.
 *              This is a simple wrapper for `useContext(AuthContext)` for cleaner code.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import the AuthContext

/**
 * Custom hook to access authentication state and actions from the AuthContext.
 * @returns {Object} The value provided by AuthContext, including `isAuthenticated`, `user`, `loading`, `login`, `register`, `logout`.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};