/**
 * @file ticketController.js
 * @description Controller for managing support tickets.
 *              Includes CRUD operations, comments, status updates, assignments, and voting.
 */

const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const upload = require('../utils/multerConfig'); // Multer middleware
const sendEmail = require('../services/emailService');
const moment = require('moment'); // For timestamp formatting in emails

/**
 * @desc    Get all tickets with filters, search, sort, and pagination
 * @route   GET /api/tickets
 * @access  Private (All authenticated users)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getTickets = asyncHandler(async (req, res) => {
    let query;
    let queryStr = { ...req.query };

    // Fields to exclude from query (for filtering/sorting/pagination, not DB fields)
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete queryStr[param]);

    // Build Mongoose query
    query = Ticket.find(queryStr);

    // Filter by user role
    // End-users can only see their own tickets
    if (req.user.role === 'end-user') {
        query = query.where('createdBy').equals(req.user._id);
    }
    // Support agents can see all tickets, but can filter by 'my_tickets' if specified
    else if (req.user.role === 'support-agent') {
        if (req.query.my_tickets === 'true') {
            query = query.where('assignedTo').equals(req.user._id);
        }
    }

    // Select specific fields (e.g., ?select=subject,status)
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Search by subject or description (case-insensitive)
    if (req.query.search) {
        query = query.or([
            { subject: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } }
        ]);
    }

    // Sort options (e.g., ?sort=createdAt,-comments.length)
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt'); // Default sort by most recent
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Ticket.countDocuments(query._conditions); // Get total count before limiting

    query = query.skip(startIndex).limit(limit);

    // Populate fields from other collections
    query = query
        .populate({ path: 'createdBy', select: 'username email' })
        .populate({ path: 'assignedTo', select: 'username email' })
        .populate({ path: 'category', select: 'name' })
        .populate({ path: 'comments.commentedBy', select: 'username' });

    const tickets = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
        pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
        success: true,
        count: tickets.length,
        total,
        pagination,
        data: tickets
    });
});

/**
 * @desc    Get single ticket by ID
 * @route   GET /api/tickets/:id
 * @access  Private (All authenticated users, if they have access to it)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id)
        .populate({ path: 'createdBy', select: 'username email role' })
        .populate({ path: 'assignedTo', select: 'username email role' })
        .populate({ path: 'category', select: 'name' })
        .populate({ path: 'comments.commentedBy', select: 'username role' });

    if (!ticket) {
        return res.status(404).json({ message: `Ticket not found with id of ${req.params.id}` });
    }

    // Authorization: Only allow creator, assigned agent, or admin to view
    const isCreator = ticket.createdBy._id.toString() === req.user._id.toString();
    const isAssignedAgent = ticket.assignedTo && ticket.assignedTo._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAssignedAgent && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.status(200).json({ success: true, data: ticket });
});

/**
 * @desc    Create a new ticket
 * @route   POST /api/tickets
 * @access  Private (End-User, Support Agent, Admin)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createTicket = asyncHandler(async (req, res) => {
    // Multer upload middleware
    upload(req, res, async (err) => {
        if (err) {
            console.error("Multer Error:", err);
            return res.status(400).json({ message: err.message || 'Error uploading files' });
        }

        const { subject, description, category } = req.body;
        const attachments = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        // Basic validation
        if (!subject || !description || !category) {
            // If files were uploaded, clean them up on validation error
            attachments.forEach(filePath => {
                try {
                    const fs = require('fs');
                    fs.unlinkSync(filePath.replace('/uploads/', './uploads/')); // Adjust path for server
                } catch (unlinkErr) {
                    console.error('Failed to delete uploaded file:', unlinkErr);
                }
            });
            return res.status(400).json({ message: 'Please provide subject, description, and category' });
        }

        // Check if category exists
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }

        const ticket = await Ticket.create({
            subject,
            description,
            category,
            createdBy: req.user._id,
            attachments
        });

        // Send email notification to Admin/Support Team (simplified, in real app, might be a specific email)
        const adminsAndAgents = await User.find({ role: { $in: ['admin', 'support-agent'] } }).select('email');
        const recipientEmails = adminsAndAgents.map(user => user.email);

        if (recipientEmails.length > 0) {
            await sendEmail({
                email: recipientEmails.join(','),
                subject: `New Ticket #${ticket._id.toString().slice(-6)}: ${ticket.subject}`,
                message: `
                    <h1>New Ticket Created</h1>
                    <p>A new ticket has been created by ${req.user.username}.</p>
                    <p><strong>Subject:</strong> ${ticket.subject}</p>
                    <p><strong>Description:</strong> ${ticket.description}</p>
                    <p><strong>Category:</strong> ${existingCategory.name}</p>
                    <p><strong>Status:</strong> ${ticket.status}</p>
                    <p><strong>Created At:</strong> ${moment(ticket.createdAt).format('LLL')}</p>
                    <p>View ticket: <a href="${process.env.CLIENT_BASE_URL || 'http://localhost:5173'}/tickets/${ticket._id}">QuickDesk Ticket Link</a></p>
                `
            });
        }

        res.status(201).json({ success: true, data: ticket });
    });
});


/**
 * @desc    Update ticket details (status, assignedTo, description by creator)
 * @route   PUT /api/tickets/:id
 * @access  Private (Support Agent, Admin, or Ticket Creator for description/comments)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateTicket = asyncHandler(async (req, res) => {
    const { status, assignedTo, description, category } = req.body;

    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        return res.status(404).json({ message: `Ticket not found with id of ${req.params.id}` });
    }

    const updatedFields = {};
    let emailMessage = '';
    let sendNotification = false;

    // Logic for Support Agent & Admin
    if (req.user.role === 'support-agent' || req.user.role === 'admin') {
        if (status && ['Open', 'In Progress', 'Resolved', 'Closed'].includes(status) && status !== ticket.status) {
            updatedFields.status = status;
            emailMessage += `<p><strong>Status Changed:</strong> From ${ticket.status} to ${status}</p>`;
            sendNotification = true;
        }
        if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
            const agent = await User.findById(assignedTo);
            if (!agent || (agent.role !== 'support-agent' && agent.role !== 'admin')) {
                return res.status(400).json({ message: 'Invalid agent ID or user is not an agent/admin' });
            }
            updatedFields.assignedTo = assignedTo;
            emailMessage += `<p><strong>Assigned To:</strong> ${agent.username}</p>`;
            sendNotification = true;
        }
        if (category && category !== ticket.category.toString()) {
            const newCategory = await Category.findById(category);
            if (!newCategory) {
                return res.status(400).json({ message: 'Invalid category ID' });
            }
            updatedFields.category = category;
            emailMessage += `<p><strong>Category Changed:</strong> To ${newCategory.name}</p>`;
            sendNotification = true;
        }
    }

    // Logic for Ticket Creator (End-User, or Agent/Admin if they are the creator)
    if (ticket.createdBy.toString() === req.user._id.toString()) {
        if (description && description !== ticket.description) {
            updatedFields.description = description;
            emailMessage += `<p><strong>Description Updated.</strong></p>`;
            sendNotification = true;
        }
        // Creator can't change status unless they are also an agent/admin handling it,
        // which is covered by the above block.
    } else if (Object.keys(updatedFields).length === 0) {
        // If no allowed fields are updated by current user role
        return res.status(403).json({ message: 'Not authorized to update this ticket or no valid fields to update' });
    }

    // Ensure only allowed users can update specific fields
    const isAllowedToUpdate = req.user.role === 'admin' ||
                              req.user.role === 'support-agent' ||
                              ticket.createdBy.toString() === req.user._id.toString();

    if (!isAllowedToUpdate) {
        return res.status(403).json({ message: 'You are not authorized to update this ticket.' });
    }

    ticket = await Ticket.findByIdAndUpdate(req.params.id, updatedFields, {
        new: true,
        runValidators: true
    })
    .populate({ path: 'createdBy', select: 'username email' })
    .populate({ path: 'assignedTo', select: 'username email' })
    .populate({ path: 'category', select: 'name' });


    // Send email notification if changes were made
    if (sendNotification) {
        const creatorEmail = ticket.createdBy.email;
        const assignedAgentEmail = ticket.assignedTo ? ticket.assignedTo.email : null;
        const recipientEmails = [creatorEmail];
        if (assignedAgentEmail && assignedAgentEmail !== creatorEmail) {
            recipientEmails.push(assignedAgentEmail);
        }

        await sendEmail({
            email: recipientEmails.join(','),
            subject: `Ticket Update #${ticket._id.toString().slice(-6)}: ${ticket.subject}`,
            message: `
                <h1>Ticket Update Notification</h1>
                <p>Ticket #${ticket._id.toString().slice(-6)} has been updated by ${req.user.username}.</p>
                ${emailMessage}
                <p><strong>Current Status:</strong> ${ticket.status}</p>
                <p><strong>Current Assignee:</strong> ${ticket.assignedTo ? ticket.assignedTo.username : 'Unassigned'}</p>
                <p>View ticket: <a href="${process.env.CLIENT_BASE_URL || 'http://localhost:5173'}/tickets/${ticket._id}">QuickDesk Ticket Link</a></p>
            `
        });
    }

    res.status(200).json({ success: true, data: ticket });
});


/**
 * @desc    Add a comment to a ticket
 * @route   POST /api/tickets/:id/comment
 * @access  Private (All authenticated users who can view the ticket)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    let ticket = await Ticket.findById(req.params.id)
        .populate({ path: 'createdBy', select: 'username email' })
        .populate({ path: 'assignedTo', select: 'username email' });

    if (!ticket) {
        return res.status(404).json({ message: `Ticket not found with id of ${req.params.id}` });
    }

    // Authorization: Only allow creator, assigned agent, or admin to comment
    const isCreator = ticket.createdBy._id.toString() === req.user._id.toString();
    const isAssignedAgent = ticket.assignedTo && ticket.assignedTo._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAssignedAgent && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to comment on this ticket' });
    }

    const newComment = {
        text,
        commentedBy: req.user._id,
        createdAt: new Date()
    };

    ticket.comments.push(newComment);
    await ticket.save();

    // Populate the newly added comment's user info before sending response
    const populatedTicket = await Ticket.findById(req.params.id)
        .populate({ path: 'createdBy', select: 'username email' })
        .populate({ path: 'assignedTo', select: 'username email' })
        .populate({ path: 'category', select: 'name' })
        .populate({ path: 'comments.commentedBy', select: 'username role' });


    // Send email notification to relevant parties (creator, assigned agent, but not the commenter)
    const creatorEmail = ticket.createdBy.email;
    const assignedAgentEmail = ticket.assignedTo ? ticket.assignedTo.email : null;
    const recipientEmails = new Set(); // Use a Set to avoid duplicate emails

    if (creatorEmail && creatorEmail !== req.user.email) { // Don't notify creator if they are the commenter
        recipientEmails.add(creatorEmail);
    }
    if (assignedAgentEmail && assignedAgentEmail !== req.user.email) { // Don't notify agent if they are the commenter
        recipientEmails.add(assignedAgentEmail);
    }

    if (recipientEmails.size > 0) {
        await sendEmail({
            email: Array.from(recipientEmails).join(','),
            subject: `New Comment on Ticket #${ticket._id.toString().slice(-6)}: ${ticket.subject}`,
            message: `
                <h1>New Comment Added</h1>
                <p>A new comment has been added to ticket #${ticket._id.toString().slice(-6)} by ${req.user.username}:</p>
                <blockquote>"${text}"</blockquote>
                <p><strong>Ticket Status:</strong> ${ticket.status}</p>
                <p><strong>Commented At:</strong> ${moment(newComment.createdAt).format('LLL')}</p>
                <p>View ticket: <a href="${process.env.CLIENT_BASE_URL || 'http://localhost:5173'}/tickets/${ticket._id}">QuickDesk Ticket Link</a></p>
            `
        });
    }

    res.status(200).json({ success: true, data: populatedTicket.comments }); // Return all comments or just the new one
});

/**
 * @desc    Upvote a ticket
 * @route   PUT /api/tickets/:id/upvote
 * @access  Private (End-User, Support Agent, Admin)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.upvoteTicket = asyncHandler(async (req, res) => {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        return res.status(404).json({ message: `Ticket not found with id of ${req.params.id}` });
    }

    // Prevent user from upvoting their own ticket (optional, but common)
    if (ticket.createdBy.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot upvote your own ticket' });
    }

    // Remove user from downvotes if they previously downvoted
    if (ticket.downvotes.includes(req.user._id)) {
        ticket.downvotes = ticket.downvotes.filter(
            (userId) => userId.toString() !== req.user._id.toString()
        );
    }

    // Add user to upvotes if not already present
    if (!ticket.upvotes.includes(req.user._id)) {
        ticket.upvotes.push(req.user._id);
    } else {
        // If already upvoted, allow "un-upvote"
        ticket.upvotes = ticket.upvotes.filter(
            (userId) => userId.toString() !== req.user._id.toString()
        );
    }

    await ticket.save();
    res.status(200).json({ success: true, data: { upvotes: ticket.upvotes.length, downvotes: ticket.downvotes.length } });
});

/**
 * @desc    Downvote a ticket
 * @route   PUT /api/tickets/:id/downvote
 * @access  Private (End-User, Support Agent, Admin)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.downvoteTicket = asyncHandler(async (req, res) => {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        return res.status(404).json({ message: `Ticket not found with id of ${req.params.id}` });
    }

    // Prevent user from downvoting their own ticket
    if (ticket.createdBy.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot downvote your own ticket' });
    }

    // Remove user from upvotes if they previously upvoted
    if (ticket.upvotes.includes(req.user._id)) {
        ticket.upvotes = ticket.upvotes.filter(
            (userId) => userId.toString() !== req.user._id.toString()
        );
    }

    // Add user to downvotes if not already present
    if (!ticket.downvotes.includes(req.user._id)) {
        ticket.downvotes.push(req.user._id);
    } else {
        // If already downvoted, allow "un-downvote"
        ticket.downvotes = ticket.downvotes.filter(
            (userId) => userId.toString() !== req.user._id.toString()
        );
    }

    await ticket.save();
    res.status(200).json({ success: true, data: { upvotes: ticket.upvotes.length, downvotes: ticket.downvotes.length } });
});


/**
 * @desc    Delete a ticket
 * @route   DELETE /api/tickets/:id
 * @access  Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        return res.status(404).json({ message: `Ticket not found with id of ${req.params.id}` });
    }

    // Delete associated attachments from file system
    if (ticket.attachments && ticket.attachments.length > 0) {
        const fs = require('fs');
        ticket.attachments.forEach(filePath => {
            const localPath = filePath.replace('/uploads/', './uploads/'); // Convert URL path to local file system path
            fs.unlink(localPath, (err) => {
                if (err) console.error(`Failed to delete attachment ${localPath}:`, err);
            });
        });
    }

    await ticket.deleteOne();
    res.status(200).json({ success: true, data: {} });
});