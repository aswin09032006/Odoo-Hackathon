const express = require('express');
const { getChatCompletion } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware'); // Auth middleware

const router = express.Router();

// Protect the route so we know who the user is (req.user)
router.route('/').post(protect, getChatCompletion);

module.exports = router;