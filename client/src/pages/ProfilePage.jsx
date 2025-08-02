/**
 * @file pages/ProfilePage.jsx
 * @description User profile page for viewing and editing personal details.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import toast from 'react-hot-toast'; // Added react-hot-toast
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
      toast.error('Please fix the errors in the form.'); // Used react-hot-toast
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
      };
      await api.put(`/users/${user._id}`, updateData);
      toast.success('Profile updated successfully!'); // Used react-hot-toast
      // A more robust app might dispatch an action to update user in AuthContext
      // For now, a simple reload to ensure context is updated
      window.location.reload();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile.'); // Used react-hot-toast
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPasswordUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) { // Validate specifically for password update
      toast.error('Please fix the password errors.'); // Used react-hot-toast
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${user._id}`, {
        password: formData.newPassword,
        currentPassword: formData.currentPassword // Backend verifies this
      });
      toast.success('Password updated successfully! Please log in again.'); // Used react-hot-toast
      logout(); // Force logout after password change for security
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error(err.response?.data?.error || 'Failed to update password. Check your current password.'); // Used react-hot-toast
    } finally {
      setLoading(false);
    }
  };


  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center flex-1 py-12 min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  return (
    // Main container: Removed shadow-xl, added border, adjusted padding for consistency
    <div className="max-w-4xl container p-8 bg-white rounded-lg border border-gray-200">
      {/* User Information Section */}
      <div className="mb-8 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">User Information</h2> {/* Removed blue-800 from H2 */}
        <p className="text-gray-700">
          <span className="font-medium">Role:</span> <span className="capitalize">{user.role}</span>
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Member Since:</span> {moment(user.createdAt).format('LLL')}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Last Updated:</span> {moment(user.updatedAt).fromNow()}
        </p>
      </div>

      {/* Edit Profile Section */}
      {/* Section Title: Smaller font, font-medium, border-bottom */}
      <h2 className="text-xl font-medium text-gray-700 mb-6 border-b border-gray-200 pb-2">Edit Profile</h2>
      <form onSubmit={handleSubmitProfileUpdate} className="mb-8 pb-8"> {/* Removed border-b as the h2 provides it */}
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

        {/* Save Profile Button: Blue themed, font-medium */}
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#504ee2] hover:bg-[#433ed1] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mt-4 flex items-center justify-center"
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

      {/* Change Password Section */}
      {/* Section Title: Smaller font, font-medium, border-bottom */}
      <h2 className="text-xl font-medium text-gray-700 mb-6 border-b border-gray-200 pb-2">Change Password</h2>
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
        {/* Change Password Button: Orange themed, font-medium */}
        <Button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mt-4 flex items-center justify-center"
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