/**
 * @file pages/Auth/RegisterPage.jsx
 * @description Registration page component for new users.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Common/Input'; // Assuming Input component has consistent styling
import Button from '../../components/Common/Button'; // Assuming Button component has consistent styling
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const { username, email, password, passwordConfirm } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required.';
    if (!email.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid.';
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== passwordConfirm) newErrors.passwordConfirm = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    const result = await register({ username, email, password });
    if (result.success) {
      navigate('/dashboard');
    }
    // Error messages are handled by toast notifications via AuthContext
  };

  return (
    <div className="flex justify-center items-center flex-1 px-4"> {/* Added horizontal padding */}
      {/* Form Container: Replaced shadow with border, adjusted padding */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-gray-200 w-full max-w-md">
        {/* Title: Reduced font size, uppercase, blue themed, tracking-wide */}
        <h2 className="text-xl font-semibold uppercase tracking-wide mb-8 text-center text-[#504ee2]">Register for QuickDesk</h2>

        <Input
          label="Username"
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={handleChange}
          placeholder="Enter your username"
          required
          error={errors.username}
        />

        <Input
          label="Email"
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          value={passwordConfirm}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
          error={errors.passwordConfirm}
        />

        {/* Register Button: Blue themed, font-medium */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#504ee2] hover:bg-[#433ed1] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mt-6 flex items-center justify-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">Registering...</span>
            </>
          ) : (
            'Register'
          )}
        </Button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[#504ee2] hover:text-[#433ed1] font-medium transition-colors duration-200" // Blue themed login link
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;