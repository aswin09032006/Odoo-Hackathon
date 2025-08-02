/**
 * @file userController.js
 * @description Controller for managing user accounts (Admin only).
 */

const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getUsers = asyncHandler(async (req, res) => {
    // Exclude password from the returned user objects
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return res.status(404).json({ message: `User not found with id of ${req.params.id}` });
    }

    res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Create a new user (Admin can create with specific roles)
 * @route   POST /api/users
 * @access  Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    // Check if user with email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user (password hashing handled by Mongoose pre-save hook)
    const user = await User.create({
        username,
        email,
        password,
        role: role || 'end-user' // Admin can specify role
    });

    res.status(201).json({ success: true, data: user });
});

/**
 * @desc    Update user details (Admin can change roles, users can update their own profile)
 * @route   PUT /api/users/:id
 * @access  Private (Admin or user's own profile)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, email, role, password } = req.body; // Password update handled separately usually

    let user = await User.findById(id);

    if (!user) {
        return res.status(404).json({ message: `User not found with id of ${id}` });
    }

    // Prevent non-admins from changing roles or other users' profiles
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
        return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;

    // Only allow admin to change roles
    if (req.user.role === 'admin' && role) {
        updateFields.role = role;
    }

    // Handle password change separately if needed, or by a specific route
    // For simplicity, directly hashing here if password field is provided
    if (password) {
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(password, salt);
    }
    
    // FindByIdAndUpdate returns the document *before* update by default. { new: true } returns the updated document.
    user = await User.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true // Run schema validators on update
    }).select('-password'); // Exclude password from the returned document

    res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: `User not found with id of ${req.params.id}` });
    }

    // Prevent admin from deleting themselves (optional)
    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    await user.deleteOne(); // Use deleteOne() for Mongoose 5.x+
    res.status(200).json({ success: true, data: {} });
});