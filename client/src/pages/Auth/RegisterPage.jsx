/**
 * @file pages/Auth/RegisterPage.jsx
 * @description Registration page component for new users.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import LoadingSpinner from '../../components/Common/LoadingSpinner'; // For loading state

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState({}); // State for form validation errors
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  // Destructure formData for easier access
  const { username, email, password, passwordConfirm } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for the field being changed
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required.';
    if (!email) newErrors.email = 'Email is required.';
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
      return; // Stop if validation fails
    }

    const result = await register({ username, email, password });
    if (result.success) {
      navigate('/dashboard'); // Redirect to dashboard on successful registration
    }
    // Error messages are handled by toast notifications via AuthContext
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Register for QuickDesk</h2>

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

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 mt-4 flex items-center justify-center"
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
            className="text-blue-500 hover:text-blue-800 font-medium"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;