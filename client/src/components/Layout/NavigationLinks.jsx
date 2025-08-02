/**
 * @file components/Layout/NavigationLinks.jsx
 * @description Renders the main navigation links for use in both Sidebar and Topbar.
 */

import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard, LogIn, Tags, TicketPlus, User, UserPlus, Users
} from 'lucide-react';

// You can keep the navItems here or move them to a separate config file
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, authRequired: true },
  { name: 'New Ticket', path: '/tickets/new', icon: TicketPlus, authRequired: true },
  { name: 'Profile', path: '/profile', icon: User, authRequired: true },
  { name: 'User Management', path: '/admin/users', icon: Users, role: 'admin', authRequired: true },
  { name: 'Category Management', path: '/admin/categories', icon: Tags, role: 'admin', authRequired: true },
  // These are not needed for the main nav, but kept for reference
  // { name: 'Login', path: '/login', icon: LogIn, authRequired: false, alwaysShowWhenLoggedOut: true },
  // { name: 'Register', path: '/register', icon: UserPlus, authRequired: false, alwaysShowWhenLoggedOut: true },
];

const NavigationLinks = ({ isCollapsed = false, onLinkClick = () => {} }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null; // Don't show any main nav links if not logged in

  return (
    <ul className="space-y-1">
      {navItems.map(item => {
        // Show link if it's for authenticated users AND (it has no role OR the user has the role)
        const showLink = item.authRequired && (!item.role || user?.role === item.role);

        if (!showLink) return null;

        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={onLinkClick} // Close mobile menu when a link is clicked
              className={clsx(
                'flex items-center py-2 px-3 rounded-md transition-colors duration-200',
                isActive
                  ? 'bg-[#504ee2] text-white'
                  : 'hover:bg-[#ccccf5] text-gray-700'
              )}
            >
              <Icon size={18} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
              {!isCollapsed && <span className="text-sm font-normal">{item.name}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavigationLinks;