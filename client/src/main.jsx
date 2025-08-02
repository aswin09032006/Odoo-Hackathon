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
import { ToastContainer } from 'react-toastify'; // For displaying notifications
import 'react-toastify/dist/ReactToastify.css'; // Toastify CSS

// Create a React root and render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider wraps the entire application to provide authentication context */}
    <AuthProvider>
      <App />
      {/* ToastContainer for displaying success/error notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  </React.StrictMode>,
);