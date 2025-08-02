/**
 * @file db.js
 * @description Database connection configuration using Mongoose.
 */

const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database.
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is successful,
 *   or rejects with an error if the connection fails.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options are deprecated and not needed in recent Mongoose versions,
            // but often seen in older tutorials. Mongoose 6+ manages connection pooling
            // and topology discovery automatically.
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true, // Deprecated in Mongoose 6.x
            // useFindAndModify: false // Deprecated in Mongoose 6.x
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;