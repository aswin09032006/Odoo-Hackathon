/**
 * @file pages/Auth/LoginPage.jsx
 * @description Login page component for existing users.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import LoadingSpinner from '../../components/Common/LoadingSpinner'; // For loading state

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Error state for client-side validation, backend errors handled by toast in AuthContext
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
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard'); // Redirect to dashboard on successful login
    }
    // Backend errors are shown via toast notifications from AuthContext
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login to QuickDesk</h2>

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

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 mt-4 flex items-center justify-center"
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
            className="text-blue-500 hover:text-blue-800 font-medium"
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;