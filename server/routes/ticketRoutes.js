/**
 * @file ticketRoutes.js
 * @description Defines API routes for ticket management.
 */

const express = require('express');
const {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    addComment,
    upvoteTicket,
    downvoteTicket,
    deleteTicket
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Auth and authorization middleware

const router = express.Router();

// All ticket routes require authentication
router.use(protect);

/**
 * @route GET /api/tickets
 * @desc Get all tickets (with filtering, searching, sorting, pagination)
 * @access Private (All authenticated users - results filtered by role in controller)
 */
/**
 * @route POST /api/tickets
 * @desc Create a new ticket
 * @access Private (All authenticated users)
 */
router.route('/').get(getTickets).post(createTicket);

/**
 * @route GET /api/tickets/:id
 * @desc Get single ticket
 * @access Private (Creator, Assigned Agent, Admin)
 */
/**
 * @route PUT /api/tickets/:id
 * @desc Update ticket (status, assignment by agent/admin; description by creator)
 * @access Private (Agent, Admin, or Ticket Creator)
 */
/**
 * @route DELETE /api/tickets/:id
 * @desc Delete a ticket
 * @access Private (Admin only)
 */
router
    .route('/:id')
    .get(getTicket)
    .put(updateTicket) // Authorization handled in controller
    .delete(authorize('admin'), deleteTicket); // Only admin can delete

/**
 * @route POST /api/tickets/:id/comment
 * @desc Add a comment to a ticket
 * @access Private (All authenticated users who can view the ticket)
 */
router.route('/:id/comment').post(addComment);

/**
 * @route PUT /api/tickets/:id/upvote
 * @desc Upvote a ticket
 * @access Private (All authenticated users)
 */
router.route('/:id/upvote').put(upvoteTicket);

/**
 * @route PUT /api/tickets/:id/downvote
 * @desc Downvote a ticket
 * @access Private (All authenticated users)
 */
router.route('/:id/downvote').put(downvoteTicket);


module.exports = router;