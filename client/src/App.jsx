/**
 * @file App.jsx
 * @description Main application component. Sets up React Router for navigation,
 *              implements role-based protected routes, and manages the main application layout.
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useWindowSize } from './hooks/useWindowSize';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/topbar'; // Import the new Topbar
import LoadingSpinner from './components/Common/LoadingSpinner';

// --- Page Components ---
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
// ... other page imports
import TicketCreatePage from './pages/TicketCreatePage';
import TicketDetailPage from './pages/TicketDetailPage';
import ProfilePage from './pages/ProfilePage';
import UserManagement from './pages/Admin/UserManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';


const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center">
            <LoadingSpinner size="lg" />
            <p className="ml-3 text-lg text-gray-700">Checking authentication...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};


const AppLayout = () => {
  const location = useLocation();
  const { width } = useWindowSize();
  
  // Mobile breakpoint (Tailwind's 'md' is 768px)
  const isMobile = width < 768;

  const noSidebarPaths = ['/login', '/register'];
  const showNav = !noSidebarPaths.includes(location.pathname);

  const AppRoutes = (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/tickets/new" element={<ProtectedRoute><TicketCreatePage /></ProtectedRoute>} />
        <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><CategoryManagement /></ProtectedRoute>} />
        
        <Route path="*" element={<div className="text-center text-3xl font-bold text-gray-700 py-20">404 - Page Not Found</div>} />
      </Routes>
  );

  if (!showNav) {
    return (
        <div className="h-screen bg-gray-100">
            {AppRoutes}
        </div>
    );
  }

  return isMobile ? (
    // MOBILE LAYOUT (Topbar + Main Content)
    <div className="flex flex-col h-screen bg-gray-100">
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {AppRoutes}
      </main>
    </div>
  ) : (
    // DESKTOP LAYOUT (Sidebar + Main Content)
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto p-6 md:p-8">
        {AppRoutes}
      </main>
    </div>
  );
};


function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;