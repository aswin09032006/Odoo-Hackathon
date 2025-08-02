/**
 * @file asyncHandler.js
 * @description A utility middleware to wrap async Express route handlers for error handling.
 *              Avoids repetitive try-catch blocks in every async controller function.
 */

/**
 * Wraps an asynchronous Express route handler to catch errors and pass them to the Express error handling middleware.
 * @param {Function} fn - The asynchronous function (controller method) to wrap.
 * @returns {Function} An Express middleware function.
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;