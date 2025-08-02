/**
 * @file pages/Admin/UserManagement.jsx
 * @description Admin page for managing user accounts (view, create, update roles, delete).
 */

import moment from 'moment';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast'; // Added react-hot-toast
import api from '../../api';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal'; // Assuming a generic modal component
import clsx from 'clsx'; // Import clsx

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // True if editing existing user
  const [currentUser, setCurrentUser] = useState(null); // User being edited/created
  const [formErrors, setFormErrors] = useState({});

  // Form data for new user or editing existing
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'end-user'
  });

  const roles = ['end-user', 'support-agent', 'admin']; // Available user roles

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users.');
      toast.error(err.response?.data?.message || 'Failed to load users'); // Used react-hot-toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors(prev => ({ ...prev, [e.target.name]: '' })); // Clear error on change
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid.';

    if (!isEditing && !formData.password.trim()) newErrors.password = 'Password is required.';
    if (formData.password && formData.password.trim().length < 6) newErrors.password = 'Password must be at least 6 characters.';

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open modal for creating a new user
  const handleCreateClick = () => {
    setIsEditing(false);
    setCurrentUser(null);
    setFormData({ username: '', email: '', password: '', role: 'end-user' });
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for editing an existing user
  const handleEditClick = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Password is not pre-filled for security
      role: user.role
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the form errors.'); // Used react-hot-toast
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        // Update user
        const updateData = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
        };
        // Only send password if it's provided (i.e., user wants to change it)
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/users/${currentUser._id}`, updateData);
        toast.success('User updated successfully!'); // Used react-hot-toast
      } else {
        // Create new user
        await api.post('/users', formData);
        toast.success('User created successfully!'); // Used react-hot-toast
      }
      setShowModal(false);
      await fetchUsers(); // Re-fetch users to update the list
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save user.'); // Used react-hot-toast
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setLoading(true);
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully!'); // Used react-hot-toast
        await fetchUsers(); // Re-fetch users
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error(err.response?.data?.error || 'Failed to delete user.'); // Used react-hot-toast
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center flex-1 py-12 min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg py-12 mt-8">{error}</div>;
  }

  return (
    // Main container: Consistent styling
    <div className="container mx-auto p-8 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4"> {/* Added border-b for header separation */}
        {/* Page Title: Consistent styling */}
        <h1 className="text-xl font-semibold uppercase tracking-wide text-[#504ee2]">User Management</h1>
        {/* Add New User Button: Consistent blue theme, font-medium */}
        <Button onClick={handleCreateClick} className="bg-[#504ee2] hover:bg-[#433ed1] text-white font-medium px-5 py-2 rounded-md">
          Add New User
        </Button>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-gray-600 text-lg py-10">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          {/* Table: Removed shadow, added border and rounded-lg for consistency */}
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600 uppercase tracking-wider"> {/* Lighter header background */}
                <th className="py-3 px-4 border-b border-gray-200 font-medium">Username</th> {/* Font-medium */}
                <th className="py-3 px-4 border-b border-gray-200 font-medium">Email</th> {/* Font-medium */}
                <th className="py-3 px-4 border-b border-gray-200 font-medium">Role</th> {/* Font-medium */}
                <th className="py-3 px-4 border-b border-gray-200 font-medium">Created At</th> {/* Font-medium */}
                <th className="py-3 px-4 border-b border-gray-200 text-center font-medium">Actions</th> {/* Font-medium */}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 text-gray-700"> {/* Softer border, text-gray-700 */}
                  <td className="py-3 px-4">{user.username}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4 capitalize">{user.role}</td>
                  <td className="py-3 px-4">{moment(user.createdAt).format('YYYY-MM-DD')}</td>
                  <td className="py-3 px-4 text-center">
                    {/* Edit Button: Softer yellow, font-medium, rounded-md */}
                    <Button onClick={() => handleEditClick(user)} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 px-3 py-1 rounded-md text-sm mr-2 font-medium">
                      Edit
                    </Button>
                    {/* Delete Button: Softer red, font-medium, rounded-md */}
                    <Button onClick={() => handleDelete(user._id)} className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-md text-sm font-medium">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Loading overlay for table */}
          {loading && users.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <LoadingSpinner size="md" />
            </div>
          )}
        </div>
      )}

      {/* User Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title={isEditing ? 'Edit User' : 'Add New User'}>
        <form onSubmit={handleSubmit}>
          {/* Modal Title inside modal content (if Modal component doesn't handle it with the main title prop) */}
          <h2 className="text-xl font-semibold uppercase tracking-wide text-[#504ee2] mb-6 text-center">{isEditing ? 'Edit User' : 'Add New User'}</h2>

          <Input
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            error={formErrors.username}
            // Assuming Input component handles its own styling internally
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={formErrors.email}
            // Assuming Input component handles its own styling internally
          />
          <Input
            label={isEditing ? 'New Password (optional)' : 'Password'}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditing}
            error={formErrors.password}
            // Assuming Input component handles its own styling internally
          />
          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 text-sm font-medium mb-2">Role:</label> {/* Font-medium */}
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#504ee2] focus:border-[#504ee2]" // Updated styles, removed shadow
            >
              {roles.map(role => (
                <option key={role} value={role} className="capitalize">{role}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            {/* Cancel Button: Outline style, font-medium */}
            <Button type="button" onClick={() => setShowModal(false)} className="border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              Cancel
            </Button>
            {/* Submit Button: Blue themed, font-medium */}
            <Button type="submit" disabled={loading} className="bg-[#504ee2] hover:bg-[#433ed1] text-white rounded-md font-medium">
              {loading ? <LoadingSpinner size="sm" color="white" /> : (isEditing ? 'Save Changes' : 'Create User')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;