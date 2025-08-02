/**
 * @file App.jsx
 * @description Main application component. Sets up React Router for navigation
 *              and implements role-based protected routes.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; // Custom hook for authentication context
import Sidebar from './components/Layout/Sidebar'; // New Sidebar component
import LoadingSpinner from './components/Common/LoadingSpinner'; // For initial loading screen

// --- Page Components ---
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketCreatePage from './pages/TicketCreatePage';
import TicketDetailPage from './pages/TicketDetailPage';
import ProfilePage from './pages/ProfilePage';
import UserManagement from './pages/Admin/UserManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';

/**
 * ProtectedRoute Component:
 * A wrapper component that enforces authentication and role-based access control for routes.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components (pages) to render if authorized.
 * @param {Array<string>} [props.roles] - Optional array of allowed roles. If empty, only requires authentication.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show a loading spinner while authentication status is being determined
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center flex-1">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and the user's role is not among them, redirect to dashboard
  if (roles && user && !roles.includes(user.role)) {
    console.warn(`Access Denied: User role "${user.role}" not authorized for this route. Required roles: ${roles.join(', ')}`);
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and authorized, render the children components
  return children;
};

function App() {
  return (
    <Router>
      {/*
        CRITICAL CHANGE HERE:
        - `h-screen`: Makes this container exactly 100% of the viewport height.
        - `overflow-hidden`: Prevents *this container itself* from scrolling,
                             forcing its flex children (sidebar and main) to manage their own overflows.
      */}
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <Sidebar /> {/* Sidebar already has h-screen, which is good */}
        <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto py-8"> {/* Main content area */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Default redirect */}

            {/* Protected Routes - Accessible to all authenticated users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/new"
              element={
                <ProtectedRoute>
                  <TicketCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <TicketDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Specific Protected Routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute roles={['admin']}>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<div className="text-center text-3xl font-bold text-gray-700 py-20">404 - Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;