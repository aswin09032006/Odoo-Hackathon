/**
 * @file jwtToken.js
 * @description Helper function to generate and sign JWT tokens.
 */

const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 * @param {string} id - The user ID to be encoded in the token payload.
 * @returns {string} The signed JWT token.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

module.exports = generateToken;