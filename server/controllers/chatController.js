/**
 * @file chatController.js
 * @description Controller for handling advanced chatbot interactions,
 *              including intent recognition and data retrieval from the database.
 */

const Groq = require('groq-sdk');
const Ticket = require('../models/Ticket'); // Import your Ticket model
const User = require('../models/User');     // Import your User model
const Category = require('../models/Category'); // Import your Category model

// Initialize Groq with your API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * @desc   Handles chat requests by recognizing intent and fetching data.
 * @route  POST /api/chat
 * @access Private
 */
exports.getChatCompletion = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id; // From 'protect' middleware
    const userRole = req.user.role; // From 'protect' middleware

    if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required' });
    }

    try {
        // Step 1: Intent Recognition using Groq
        const intent = await determineUserIntent(message);

        let responseMessage;

        // Step 2: Act on the recognized intent
        switch (intent.action) {
            case 'get_tickets':
                responseMessage = await handleGetTickets(intent.params, userId, userRole);
                break;
            case 'get_user_info':
                responseMessage = await handleGetUserInfo(intent.params, userRole);
                break;
            case 'get_categories':
                responseMessage = await handleGetCategories();
                break;
            default: // 'general_query'
                responseMessage = await handleGeneralQuery(message);
        }

        res.status(200).json({ success: true, message: responseMessage });

    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

/**
 * Uses Groq to determine the user's intent from their message.
 */
async function determineUserIntent(userMessage) {
    const systemPrompt = `
        You are an AI assistant for a helpdesk application called QuickDesk.
        Your task is to analyze the user's message and determine their intent.
        Respond with a JSON object only, with two keys: "action" and "params".

        Possible values for "action":
        - "get_tickets": If the user is asking to see their support tickets.
        - "get_user_info": If the user is asking for details about a specific user.
        - "get_categories": If the user is asking about available ticket categories.
        - "general_query": For any other question or general conversation.

        For "params", extract relevant information.
        - For "get_tickets", look for a status like 'Open', 'Closed', 'In Progress', 'Resolved'. If none, use 'all'.
        - For "get_user_info", look for a username. If none, use 'null'.

        Examples:
        - User: "show me my open tickets" -> {"action": "get_tickets", "params": {"status": "Open"}}
        - User: "what tickets are resolved?" -> {"action": "get_tickets", "params": {"status": "Resolved"}}
        - User: "tell me about the user 'janesmith'" -> {"action": "get_user_info", "params": {"username": "janesmith"}}
        - User: "what categories are there?" -> {"action": "get_categories", "params": {}}
        - User: "hello how are you?" -> {"action": "general_query", "params": {}}
    `;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        model: 'llama3-8b-8192',
        temperature: 0,
        response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
}

// --- Intent Handling Functions ---

async function handleGetTickets(params, userId, userRole) {
    let query = {};

    // Security: Non-admins can only see their own tickets.
    if (userRole !== 'admin') {
        query.createdBy = userId;
    }

    if (params.status && params.status !== 'all') {
        // Capitalize status to match schema enum ('Open', 'Closed', etc.)
        query.status = params.status.charAt(0).toUpperCase() + params.status.slice(1);
    }

    const tickets = await Ticket.find(query).limit(10).sort({ createdAt: -1 });

    if (tickets.length === 0) {
        return `I couldn't find any tickets matching that criteria.`;
    }

    let response = `Here are the latest tickets I found:\n`;
    tickets.forEach(t => {
        response += `\n- **Subject:** ${t.subject}\n  - **Status:** ${t.status}\n  - **Priority:** ${t.priority}\n`;
    });
    return response;
}

async function handleGetUserInfo(params, userRole) {
    // Security: Only admins can look up other users.
    if (userRole !== 'admin') {
        return "Sorry, you don't have permission to look up user information.";
    }
    if (!params.username) {
        return "Please specify a username to look up.";
    }

    const user = await User.findOne({ username: params.username }).select('-password');
    if (!user) {
        return `I couldn't find a user with the username '${params.username}'.`;
    }

    return `Here is the information for user '${user.username}':\n- **Email:** ${user.email}\n- **Role:** ${user.role}\n- **Member Since:** ${user.createdAt.toDateString()}`;
}

async function handleGetCategories() {
    const categories = await Category.find({}).select('name');
    if (categories.length === 0) {
        return "No ticket categories have been set up yet.";
    }
    const categoryNames = categories.map(c => c.name).join(', ');
    return `The available ticket categories are: ${categoryNames}.`;
}

async function handleGeneralQuery(userMessage) {
    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a helpful assistant named GroqBot.' },
            { role: 'user', content: userMessage }
        ],
        model: 'llama3-8b-8192'
    });
    return completion.choices[0].message.content;
}