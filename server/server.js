/**
 * @file server.js
 * @description Entry point for the QuickDesk backend server.
 *              Initializes the Express app, connects to the database, and starts the server.
 */

const app = require('./app'); // Import the configured Express application
const connectDB = require('./config/db'); // Import the database connection function
const dotenv = require('dotenv'); // For loading environment variables

// Load environment variables from the .env file in the current directory (server/)
// FIX: Changed path to './.env'
dotenv.config({ path: './.env' });

// Connect to the MongoDB database
connectDB();

// Define the port the server will listen on.
// Uses the PORT environment variable if available, otherwise defaults to 5000.
const PORT = process.env.PORT || 5000;

// Start the Express server
const server = app.listen(
    PORT,
    // Log a message to the console indicating the server's status and port
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// --- Unhandled Promise Rejection Handling ---
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});