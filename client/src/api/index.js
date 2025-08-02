/**
 * @file api/index.js
 * @description Configures an Axios instance for API requests.
 *              Includes request and response interceptors for JWT handling and error management.
 */

import axios from 'axios';
// import { toast } from 'react-toastify'; // Removed react-toastify
import toast from 'react-hot-toast'; // Added react-hot-toast

// Create an Axios instance with a base URL.
// The base URL is pulled from environment variables (e.g., .env.development, .env.production).
// This allows easy switching between development and production API endpoints.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // Default content type for requests
  },
});

/**
 * Axios Request Interceptor:
 * Adds the JWT token from localStorage to the Authorization header of every outgoing request.
 * This ensures that protected routes on the backend receive the necessary authentication token.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token as a Bearer token
    }
    return config; // Continue with the request
  },
  (error) => {
    // Handle request errors (e.g., network issues)
    return Promise.reject(error);
  }
);

/**
 * Axios Response Interceptor:
 * Handles responses from the API, specifically dealing with 401 Unauthorized errors.
 * If a 401 is received, it suggests the token might be expired or invalid, so it logs out the user.
 */
api.interceptors.response.use(
  (response) => response, // If the response is successful, simply return it
  (error) => {
    // Check if the error is a 401 Unauthorized response
    if (error.response && error.response.status === 401) {
      console.error('API Error: 401 Unauthorized. Token might be expired or invalid.');
      toast.error('Session expired or unauthorized. Please log in again.'); // Use react-hot-toast
      // Remove the invalid token and trigger a logout (e.g., by reloading or dispatching a global logout action)
      localStorage.removeItem('token');
      // A more robust solution would be to dispatch a global logout action
      // For simplicity, directly reload or navigate to login.
      window.location.href = '/login'; // Redirect to login page
    }
    // Re-throw the error so it can be caught by the component making the request
    return Promise.reject(error);
  }
);

export default api;
