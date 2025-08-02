/**
 * @file authRoutes.js
 * @description Defines API routes for user authentication.
 */

const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Middleware to protect routes

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get JWT token
 * @access Public
 */
router.post('/login', login);

/**
 * @route GET /api/auth/me
 * @desc Get current logged in user's profile
 * @access Private
 */
router.get('/me', protect, getMe);

module.exports = router;