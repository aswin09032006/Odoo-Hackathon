/**
 * @file categoryController.js
 * @description Controller for managing ticket categories (Admin only for CRUD).
 */

const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public (Can be accessed by anyone to populate dropdowns)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    res.status(200).json({ success: true, count: categories.length, data: categories });
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Public (Can be accessed by anyone)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({ message: `Category not found with id of ${req.params.id}` });
    }

    res.status(200).json({ success: true, data: category });
});

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({ message: `Category not found with id of ${req.params.id}` });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== category.name) {
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingCategory && existingCategory._id.toString() !== req.params.id) {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;

    category = await Category.findByIdAndUpdate(req.params.id, updateFields, {
        new: true, // Return the updated document
        runValidators: true // Run Mongoose schema validators on update
    });

    res.status(200).json({ success: true, data: category });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({ message: `Category not found with id of ${req.params.id}` });
    }

    // In a real application, you might want to prevent deleting categories
    // that are currently associated with tickets, or reassign tickets.
    // For simplicity, we just delete the category here.
    await category.deleteOne(); // Use deleteOne() for Mongoose 5.x+
    res.status(200).json({ success: true, data: {} });
});