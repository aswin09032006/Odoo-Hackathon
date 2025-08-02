/**
 * @file utils/insertUser.js
 * @description CLI script to insert a new user into the database.
 *              Useful for creating initial admin accounts or testing.
 *
 * Usage:
 * node utils/insertUser.js --username <username> --email <email> --password <password> [--role <role>]
 *
 * Example:
 * node utils/insertUser.js --username admin_user --email admin@quickdesk.com --password adminpass --role admin
 * node utils/insertUser.js --username jane_doe --email jane@example.com --password secretpass
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User'); // Import your User model

// Load environment variables (ensure .env is configured correctly for the server)
dotenv.config({ path: './.env' }); // Assuming .env is directly in server/ directory

// Function to parse command-line arguments
const parseArgs = () => {
    const args = {};
    const rawArgs = process.argv.slice(2); // Get arguments after 'node script.js'

    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];
        if (arg.startsWith('--')) {
            const parts = arg.substring(2).split('='); // Split by '=' for --key=value
            const key = parts[0];

            if (parts.length > 1) {
                // It's a --key=value argument
                args[key] = parts[1];
            } else {
                // It's a --key argument, check the next argument for its value
                // If the next argument doesn't start with '--', it's the value
                if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('--')) {
                    args[key] = rawArgs[i + 1];
                    i++; // Increment i to consume the value argument
                } else {
                    // It's a boolean flag like --verbose (no explicit value)
                    args[key] = true;
                }
            }
        }
    }
    return args;
};

const run = async () => {
    // Connect to DB
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to DB: ${err.message}`);
        mongoose.connection.close(); // Ensure connection is closed on error
        process.exit(1);
    }

    const args = parseArgs();
    const { username, email, password, role } = args;

    if (!username || !email || !password) {
        console.error('Usage: node utils/insertUser.js --username <username> --email <email> --password <password> [--role <role>]');
        mongoose.connection.close();
        process.exit(1);
    }

    try {
        // Check if user already exists by email
        let userExists = await User.findOne({ email });
        if (userExists) {
            console.warn(`User with email "${email}" already exists. Skipping creation.`);
            mongoose.connection.close();
            process.exit(0);
        }

        // Check if user already exists by username
        userExists = await User.findOne({ username });
        if (userExists) {
            console.warn(`User with username "${username}" already exists. Skipping creation.`);
            mongoose.connection.close();
            process.exit(0);
        }

        const newUser = {
            username,
            email,
            password, // Password hashing will be handled by the pre-save hook in the User model
            role: role || 'end-user' // Default to end-user if role not specified
        };

        const user = await User.create(newUser);
        console.log('\nUser created successfully:');
        console.log(`_id: ${user._id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Created At: ${user.createdAt}\n`);

    } catch (err) {
        console.error(`Error creating user: ${err.message}`);
        if (err.name === 'ValidationError') {
            // Mongoose validation errors
            for (let field in err.errors) {
                console.error(`- ${err.errors[field].message}`);
            }
        } else if (err.code === 11000) {
            // Duplicate key error
            const field = Object.keys(err.keyValue).join(', ');
            console.error(`- Duplicate value for ${field}: "${err.keyValue[field]}". It must be unique.`);
        }
    } finally {
        // Close the database connection regardless of success or failure
        await mongoose.connection.close(); // Use await as close() is async
        console.log('Database connection closed.');
    }
};

run();