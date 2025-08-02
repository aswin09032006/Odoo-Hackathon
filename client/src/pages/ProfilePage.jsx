/**
 * @file pages/ProfilePage.jsx
 * @description User profile page for viewing and editing personal details.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import { toast } from 'react-toastify';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import moment from 'moment';

const ProfilePage = () => {
  const { user, loading: authLoading, logout } = useAuth(); // Get current user info from AuthContext
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username,
        email: user.email,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' })); // Clear error on change
  };

  const validateForm = (isPasswordUpdate = false) => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username cannot be empty.';
    if (!formData.email.trim()) newErrors.email = 'Email cannot be empty.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format.';

    if (isPasswordUpdate) {
      if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required.';
      if (!formData.newPassword) newErrors.newPassword = 'New password is required.';
      else if (formData.newPassword.length < 6) newErrors.newPassword = 'New password must be at least 6 characters.';
      if (formData.newPassword !== formData.confirmNewPassword) newErrors.confirmNewPassword = 'New passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProfileUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
      };
      // For simplicity, directly calling update user API. In a real app, you might have separate endpoints.
      await api.put(`/users/${user._id}`, updateData);
      toast.success('Profile updated successfully!');
      // Optionally, re-fetch user data to update AuthContext state
      // This would involve calling an update function on useAuth context
      // For now, reload to ensure context is updated
      window.location.reload();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPasswordUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) { // Validate specifically for password update
      toast.error('Please fix the password errors.');
      return;
    }

    setLoading(true);
    try {
      // For a real app, create a separate backend endpoint for password update that validates current password
      // For this example, we'll send it to the same updateUser endpoint assuming it handles password hashing.
      // NOTE: A more secure approach is a dedicated /auth/change-password endpoint.
      await api.put(`/users/${user._id}`, {
        password: formData.newPassword,
        currentPassword: formData.currentPassword // This would be verified by backend
      });
      toast.success('Password updated successfully! Please log in again.');
      logout(); // Force logout after password change for security
      // navigate('/login'); // Redirect is handled by logout in AuthContext already
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error(err.response?.data?.error || 'Failed to update password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };


  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl my-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Profile</h1>

      <div className="mb-8 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">User Information</h2>
        <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
        <p><strong>Member Since:</strong> {moment(user.createdAt).format('LLL')}</p>
        <p><strong>Last Updated:</strong> {moment(user.updatedAt).fromNow()}</p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmitProfileUpdate} className="mb-8 border-b pb-8">
        <Input
          label="Username"
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          error={errors.username}
        />

        <Input
          label="Email"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={errors.email}
        />

        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors duration-200 mt-4 flex items-center justify-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">Saving Profile...</span>
            </>
          ) : (
            'Save Profile Changes'
          )}
        </Button>
      </form>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Change Password</h2>
      <form onSubmit={handleSubmitPasswordUpdate}>
        <Input
          label="Current Password"
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          error={errors.currentPassword}
        />
        <Input
          label="New Password"
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          error={errors.newPassword}
        />
        <Input
          label="Confirm New Password"
          type="password"
          id="confirmNewPassword"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          required
          error={errors.confirmNewPassword}
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors duration-200 mt-4 flex items-center justify-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">Updating Password...</span>
            </>
          ) : (
            'Change Password'
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;