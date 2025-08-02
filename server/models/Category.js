/**
 * @file Category.js
 * @description Mongoose schema and model for Ticket Category.
 */

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true, // Category names must be unique
        trim: true,
        maxlength: [50, 'Category name cannot be more than 50 characters']
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot be more than 200 characters'],
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Mongoose will automatically add `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('Category', CategorySchema);