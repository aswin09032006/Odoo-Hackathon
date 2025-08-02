/**
 * @file errorHandler.js
 * @description Centralized error handling middleware for Express.
 *              Catches errors passed via `next(err)` and sends a standardized response.
 */

/**
 * Express error handling middleware.
 * @param {Error} err - The error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function (not used here but required signature).
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the stack trace for debugging

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = `Resource not found with ID of ${err.value}`;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        // Extract the field name from the error message for a user-friendly message
        const field = Object.keys(err.keyValue).join(', ');
        message = `Duplicate field value entered: ${field} must be unique`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        // Map validation errors to an array of messages
        message = Object.values(err.errors).map(val => val.message);
    }

    res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = errorHandler;