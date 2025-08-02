/**
 * @file emailService.js
 * @description Service for sending emails using Nodemailer.
 */

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables if not already loaded
dotenv.config({ path: './config/config.env' });

/**
 * Configures and sends an email.
 * @async
 * @function sendEmail
 * @param {Object} options - Email options.
 * @param {string} options.email - Recipient's email address.
 * @param {string} options.subject - Subject of the email.
 * @param {string} options.message - HTML content of the email.
 * @returns {Promise<void>} A promise that resolves when the email is sent successfully.
 */
const sendEmail = async (options) => {
    // 1. Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // your Mailtrap or other SMTP user
            pass: process.env.EMAIL_PASS, // your Mailtrap or other SMTP password
        },
    });

    // 2. Define email options
    const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    // 3. Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        // For development, log the URL to view the email in Mailtrap if applicable
        if (process.env.NODE_ENV === 'development' && process.env.EMAIL_HOST === 'sandbox.smtp.mailtrap.io') {
            console.log(`Preview URL: https://mailtrap.io/inboxes/${process.env.EMAIL_USER}/messages/${info.messageId}`);
        }
    } catch (error) {
        console.error('Error sending email:', error);
        // In a production app, you might want to log this error to a monitoring service
        // or queue it for retry. For this example, just logging to console.
    }
};

module.exports = sendEmail;