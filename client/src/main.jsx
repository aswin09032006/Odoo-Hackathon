/**
 * @file main.jsx
 * @description The entry point for the React application.
 *              Sets up React Strict Mode and the global AuthContext provider.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Main App component containing routing
import './index.css'; // Global CSS (e.g., Tailwind CSS imports)
import { AuthProvider } from './context/AuthContext'; // Context provider for authentication state
import { Toaster } from 'react-hot-toast'; // For displaying notifications - Replaced react-toastify
// import 'react-toastify/dist/ReactToastify.css'; // Removed react-toastify CSS

// Create a React root and render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider wraps the entire application to provide authentication context */}
    <AuthProvider>
      <App />
      {/* ToastContainer for displaying success/error notifications - Replaced with react-hot-toast Toaster */}
      <Toaster
        position="bottom-center" // Display toasts at the bottom center
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          // Style for all toasts
          style: {
            background: '#333',
            color: '#fff',
            fontSize: '1rem',
            borderRadius: '8px',
            padding: '12px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
          // Default options for specific types
          success: {
            iconTheme: {
              primary: '#22c55e', // green-500
              secondary: '#fff',
            },
            style: {
              background: '#dcfce7', // green-50
              color: '#16a34a', // green-600
              borderColor: '#22c55e',
              borderWidth: '1px'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // red-500
              secondary: '#fff',
            },
            style: {
              background: '#fee2e2', // red-50
              color: '#dc2626', // red-600
              borderColor: '#ef4444',
              borderWidth: '1px'
            }
          },
          // For info toasts, using default icon or no icon
          info: {
            iconTheme: {
              primary: '#3b82f6', // blue-500
              secondary: '#fff',
            },
            style: {
              background: '#e0f2fe', // light blue
              color: '#2563eb', // blue-600
              borderColor: '#3b82f6',
              borderWidth: '1px'
            }
          }
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
);
