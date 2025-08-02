/**
 * @file pages/Admin/UserManagement.jsx
 * @description Admin page for managing user accounts (view, create, update roles, delete).
 */

import moment from 'moment';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal'; // Assuming a generic modal component

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
      toast.error(err.response?.data?.message || 'Failed to load users');
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
      toast.error('Please correct the form errors.');
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
        toast.success('User updated successfully!');
      } else {
        // Create new user
        await api.post('/users', formData);
        toast.success('User created successfully!');
      }
      setShowModal(false);
      await fetchUsers(); // Re-fetch users to update the list
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save user.');
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
        toast.success('User deleted successfully!');
        await fetchUsers(); // Re-fetch users
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error(err.response?.data?.error || 'Failed to delete user.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 my-8 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md">
          Add New User
        </Button>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-gray-600 text-xl py-10">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 border-b">Username</th>
                <th className="py-3 px-4 border-b">Email</th>
                <th className="py-3 px-4 border-b">Role</th>
                <th className="py-3 px-4 border-b">Created At</th>
                <th className="py-3 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{user.username}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4 capitalize">{user.role}</td>
                  <td className="py-3 px-4">{moment(user.createdAt).format('YYYY-MM-DD')}</td>
                  <td className="py-3 px-4 text-center">
                    <Button onClick={() => handleEditClick(user)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm mr-2">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(user._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title={isEditing ? 'Edit User' : 'Add New User'}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            error={formErrors.username}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={formErrors.email}
          />
          <Input
            label={isEditing ? 'New Password (optional)' : 'Password'}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditing}
            error={formErrors.password}
          />
          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {roles.map(role => (
                <option key={role} value={role} className="capitalize">{role}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <LoadingSpinner size="sm" color="white" /> : (isEditing ? 'Save Changes' : 'Create User')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;