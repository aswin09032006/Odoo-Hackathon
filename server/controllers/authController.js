/**
 * @file authController.js
 * @description Controller for user authentication (registration, login, getting current user).
 */

const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const generateToken = require('../utils/jwtToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.register = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    // Check if user already exists with the given email
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = await User.create({
        username,
        email,
        password, // Password will be hashed by the pre-save hook in User model
        role: role || 'end-user' // Default role to 'end-user' if not specified
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), // Generate JWT and send it
            createdAt: user.createdAt
        });
    } else {
        res.status(400).json({ message: 'Invalid user data provided' });
    }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate email and password presence
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Find user by email (select password explicitly as it's excluded by default)
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // Generate JWT and send it
        createdAt: user.createdAt
    });
});

/**
 * @desc    Get current logged in user's profile
 * @route   GET /api/auth/me
 * @access  Private
 * @param {Object} req - Express request object (with req.user populated by `protect` middleware).
 * @param {Object} res - Express response object.
 */
exports.getMe = asyncHandler(async (req, res) => {
    // req.user is populated by the `protect` middleware
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });
});