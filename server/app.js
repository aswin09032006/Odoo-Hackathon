/**
 * @file app.js
 * @description Express application setup, including middleware, route mounting, and error handling.
 */

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from the .env file in the current directory (server/)
// FIX: Changed path to './.env'
dotenv.config({ path: './.env' });

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const chatRoutes = require('./routes/chatRoutes'); // <--- ADD THIS LINE to import chat routes

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tickets', ticketRoutes);
+app.use('/api/chat', chatRoutes); // <--- ADD THIS LINE to mount chat routes

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;