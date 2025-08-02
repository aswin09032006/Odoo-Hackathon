/**
 * @file User.js
 * @description Mongoose schema and model for User.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true,
        maxlength: [50, 'Username cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Do not return password in queries by default
    },
    role: {
        type: String,
        enum: ['end-user', 'support-agent', 'admin'],
        default: 'end-user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Mongoose will automatically add `createdAt` and `updatedAt` fields
});

// Middleware to encrypt password before saving the user
UserSchema.pre('save', async function(next) {
    // Only hash the password if it's new or has been modified
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
});

/**
 * Method to compare entered password with hashed password in the database.
 * @param {string} enteredPassword - The password entered by the user.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);