/**
 * @file userRoutes.js
 * @description Defines API routes for user management (Admin access required).
 */

const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Auth and authorization middleware

const router = express.Router();

// All routes here require authentication (`protect`)
// and specific roles (`authorize`)

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (Admin only)
 */
router.route('/').get(protect, authorize('admin'), getUsers);

/**
 * @route POST /api/users
 * @desc Create a new user (admin can create users with specific roles)
 * @access Private (Admin only)
 */
router.route('/').post(protect, authorize('admin'), createUser);

/**
 * @route GET /api/users/:id
 * @desc Get single user
 * @access Private (Admin only)
 */
/**
 * @route PUT /api/users/:id
 * @desc Update user details (admin can update any user, user can update their own)
 * @access Private (Admin or user's own profile, logic handled in controller)
 */
/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private (Admin only)
 */
router
    .route('/:id')
    .get(protect, authorize('admin'), getUser) // Admin can get any user
    .put(protect, authorize('admin', 'end-user', 'support-agent'), updateUser) // Admin can update any, users can update self
    .delete(protect, authorize('admin'), deleteUser); // Admin can delete any user

module.exports = router;