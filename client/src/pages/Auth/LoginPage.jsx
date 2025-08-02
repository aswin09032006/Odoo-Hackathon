/**
 * @file pages/Auth/LoginPage.jsx
 * @description Login page component for existing users.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Common/Input'; // Assuming Input component has consistent styling
import Button from '../../components/Common/Button'; // Assuming Button component has consistent styling
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email address is invalid.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
    // Backend errors are shown via toast notifications from AuthContext
  };

  return (
    <div className="flex justify-center items-center flex-1 px-4"> {/* Added horizontal padding */}
      {/* Form Container: Replaced shadow with border, adjusted padding */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-gray-200 w-full max-w-md">
        {/* Title: Reduced font size, uppercase, blue themed, tracking-wide */}
        <h2 className="text-xl font-semibold uppercase tracking-wide mb-8 text-center text-[#504ee2]">Login to QuickDesk</h2>

        <Input
          label="Email"
          type="email"
          id="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          placeholder="Enter your email"
          required
          error={emailError}
        />

        <Input
          label="Password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
          placeholder="Enter your password"
          required
          error={passwordError}
        />

        {/* Login Button: Blue themed, font-medium */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#504ee2] hover:bg-[#433ed1] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mt-6 flex items-center justify-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">Logging In...</span>
            </>
          ) : (
            'Login'
          )}
        </Button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-[#504ee2] hover:text-[#433ed1] font-medium transition-colors duration-200" // Blue themed register link
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;