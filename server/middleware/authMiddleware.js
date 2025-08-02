/**
 * @file authMiddleware.js
 * @description Middleware for authentication (JWT protection) and authorization (role-based access control).
 */

const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

/**
 * Middleware to protect routes by verifying JWT token.
 * Attaches the authenticated user to `req.user`.
 * @async
 * @function protect
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Extract token from "Bearer TOKEN"
        token = req.headers.authorization.split(' ')[1];
    }

    // If token is not found in header
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Verify token using JWT_SECRET from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from decoded token and attach to request object
        // Exclude the password field for security
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
});

/**
 * Middleware for role-based authorization.
 * Checks if the authenticated user's role is included in the allowed roles.
 * @function authorize
 * @param {...string} roles - A variable number of strings representing allowed roles (e.g., 'admin', 'support-agent').
 * @returns {Function} An Express middleware function.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // If user role is not among the allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next(); // User is authorized, proceed
    };
};

module.exports = { protect, authorize };