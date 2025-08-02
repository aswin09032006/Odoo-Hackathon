/**
 * @file Ticket.js
 * @description Mongoose schema and model for Support Ticket.
 */

const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Ticket subject is required'],
        trim: true,
        maxlength: [100, 'Subject cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Ticket description is required']
    },
    category: {
        type: mongoose.Schema.ObjectId, // Reference to the Category model
        ref: 'Category',
        required: [true, 'Please select a category']
    },
    createdBy: {
        type: mongoose.Schema.ObjectId, // Reference to the User who created the ticket
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId, // Reference to the Support Agent assigned
        ref: 'User',
        default: null // Can be assigned later by an agent
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Low' // Added for better help desk functionality
    },
    comments: [
        {
            text: {
                type: String,
                required: true
            },
            commentedBy: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    attachments: [String], // Array of URLs/paths to uploaded files (e.g., '/uploads/filename.jpg')
    upvotes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true // Mongoose will automatically add `createdAt` and `updatedAt` fields
});

// Index common query fields for better performance
TicketSchema.index({ status: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ createdBy: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ subject: 'text', description: 'text' }); // For text search

module.exports = mongoose.model('Ticket', TicketSchema);