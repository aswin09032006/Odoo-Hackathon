/**
 * @file categoryRoutes.js
 * @description Defines API routes for ticket category management.
 */

const express = require('express');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Auth and authorization middleware

const router = express.Router();

/**
 * @route GET /api/categories
 * @desc Get all categories
 * @access Public (or Private if you want to restrict even viewing)
 */
router.route('/').get(getCategories); // Public route for fetching categories

/**
 * @route POST /api/categories
 * @desc Create new category
 * @access Private (Admin only)
 */
router.route('/').post(protect, authorize('admin'), createCategory);

/**
 * @route GET /api/categories/:id
 * @desc Get single category
 * @access Public
 */
/**
 * @route PUT /api/categories/:id
 * @desc Update category
 * @access Private (Admin only)
 */
/**
 * @route DELETE /api/categories/:id
 * @desc Delete category
 * @access Private (Admin only)
 */
router
    .route('/:id')
    .get(getCategory) // Public route for fetching single category
    .put(protect, authorize('admin'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;