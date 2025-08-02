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
        // Step 1: Intent Recognition using Groq (NLU)
        const intent = await determineUserIntent(message);

        let responseMessage;

        // Step 2: Act on the recognized intent and generate response (NLG)
        switch (intent.action) {
            case 'get_tickets':
                responseMessage = await handleGetTickets(intent.params, userId, userRole);
                break;
            case 'get_user_info':
                responseMessage = await handleGetUserInfo(intent.params, userId, userRole);
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
        res.status(500).json({ success: false, error: 'I apologize, but I encountered an internal error. Please try again later.' });
    }
};

/**
 * Uses Groq to determine the user's intent from their message.
 * This function is core to the NLU (Natural Language Understanding) part.
 */
async function determineUserIntent(userMessage) {
    const systemPrompt = `
        You are an AI assistant for a helpdesk application called QuickDesk.
        Your primary task is to understand the user's request and categorize it into specific actions.
        You must respond with a JSON object only. Respond directly with the JSON. Do not include any other text.

        The JSON object should have two keys: "action" and "params".

        "action" can be one of the following:
        - "get_tickets": The user wants to retrieve information about support tickets.
        - "get_user_info": The user is asking for details about a user account.
        - "get_categories": The user is asking about available ticket categories.
        - "general_query": Any request that doesn't fit the above categories (e.g., greetings, general questions).

        "params" should be a JSON object containing relevant parameters for the action.
        - For "get_tickets":
            - "status": (string, optional) Can be 'open', 'closed', 'in progress', 'resolved'. If not specified, use 'all'.
            - "limit": (number, optional) The maximum number of tickets to retrieve. Default to 5 if not specified.
        - For "get_user_info":
            - "username": (string, optional) The username of the user to look up. If not specified, assume 'self' for the current user.
        - For "get_categories": No specific parameters needed.
        - For "general_query": No parameters needed.

        Strictly output only the JSON object. Do not include any other text or formatting.
    `;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        model: 'llama3-8b-8192',
        temperature: 0, // Keep low for intent recognition
        response_format: { type: 'json_object' }
    });

    try {
        const content = completion.choices[0].message.content;
        // Sometimes Groq might add markdown around JSON, strip it
        const jsonString = content.replace(/^```json\n|\n```$/g, '').trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse intent JSON from Groq:", completion.choices[0].message.content, e);
        return { action: 'general_query', params: {} };
    }
}

// --- Intent Handling Functions (with NLG via Groq) ---

async function handleGetTickets(params, userId, userRole) {
    let query = {};
    const limit = params.limit ? parseInt(params.limit) : 5; // Default limit

    if (userRole !== 'admin') {
        query.createdBy = userId;
    }

    if (params.status && params.status !== 'all') {
        query.status = params.status.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    const tickets = await Ticket.find(query).limit(limit).sort({ createdAt: -1 }).populate('category', 'name').populate('createdBy', 'username');

    let groqPrompt;
    if (tickets.length === 0) {
        groqPrompt = `The user asked for tickets with status "${params.status || 'all'}" for ${userRole === 'admin' ? 'all users' : 'their own account'}. No tickets were found matching this criteria. Respond concisely with this information.`;
    } else {
        const ticketData = tickets.map(t => ({
            subject: t.subject,
            status: t.status,
            priority: t.priority,
            category: t.category?.name || 'N/A',
            createdBy: t.createdBy?.username || 'N/A',
            createdAt: t.createdAt.toISOString()
        }));
        groqPrompt = `Here is ticket data in JSON: ${JSON.stringify(ticketData)}. Generate a very short, clear list of these tickets. Include only subject, status, and category for each. Add a brief intro like "Here are your tickets:" or "Found X tickets:".`;
    }

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a concise QuickDesk assistant. Provide brief, clear summaries of ticket data. Avoid conversational filler or greetings beyond a short intro. Use bullet points for lists.' },
            { role: 'user', content: groqPrompt }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.3, // Keep low for directness
    });
    return completion.choices[0].message.content;
}

async function handleGetUserInfo(params, currentUserId, userRole) {
    let targetUser;

    if (params.username === 'self' || !params.username) {
        targetUser = await User.findById(currentUserId).select('-password');
    } else {
        if (userRole !== 'admin') {
            return "Sorry, you don't have permission to look up other user information.";
        }
        targetUser = await User.findOne({ username: params.username }).select('-password');
    }

    let groqPrompt;
    if (!targetUser) {
        groqPrompt = `The user asked for information about '${params.username}'. No such user was found. State this concisely.`;
    } else {
        const userData = {
            username: targetUser.username,
            email: targetUser.email,
            role: targetUser.role,
            memberSince: targetUser.createdAt.toDateString(),
            // Only include lastLogin if it actually exists in your User model
            // lastLogin: targetUser.lastLoginAt ? targetUser.lastLoginAt.toDateString() : 'N/A'
        };
        groqPrompt = `Here is user data in JSON: ${JSON.stringify(userData)}. Generate a very short, clear summary of this user's details. Include username, email, and role. Avoid extra details.`;
    }

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a concise QuickDesk assistant. Provide brief, clear user information. Avoid conversational filler or greetings. Be direct.' },
            { role: 'user', content: groqPrompt }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.3,
    });
    return completion.choices[0].message.content;
}

async function handleGetCategories() {
    const categories = await Category.find({}).select('name description');

    let groqPrompt;
    if (categories.length === 0) {
        groqPrompt = `The user asked for ticket categories. There are no categories configured. State this concisely.`;
    } else {
        const categoryData = categories.map(c => ({
            name: c.name,
            description: c.description || 'N/A' // Change 'No description available' to 'N/A' for brevity if no description
        }));
        groqPrompt = `Here is category data in JSON: ${JSON.stringify(categoryData)}. Generate a very short, clear list of these categories. Include name and description if available. Use bullet points.`;
    }

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a concise QuickDesk assistant. Provide a brief, clear list of categories. Avoid conversational filler. Use bullet points.' },
            { role: 'user', content: groqPrompt }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.3,
    });
    return completion.choices[0].message.content;
}

async function handleGeneralQuery(userMessage) {
    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a helpful QuickDesk assistant named GroqBot. Respond concisely and professionally. If you cannot fulfill a request due to scope, politely and briefly state so. Avoid lengthy explanations or general knowledge beyond QuickDesk.' },
            { role: 'user', content: userMessage }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.5, // Slightly higher for general conversation, but still leaning towards directness
    });
    return completion.choices[0].message.content;
}