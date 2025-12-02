const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../ai-service');

// Store conversation histories (in production, use Redis or database)
const conversationHistories = new Map();

/**
 * POST /api/ai/chat
 * Send a message to the AI assistant and get a response
 */
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, clearHistory } = req.body;
        const userId = req.user.id;  // Changed from req.user.userId to req.user.id
        const userRole = req.user.role;

        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a non-empty string'
            });
        }

        // Clear history if requested
        if (clearHistory) {
            conversationHistories.delete(userId);
        }

        // Get or initialize conversation history
        let history = conversationHistories.get(userId) || [];

        // Limit history to last 10 messages to avoid token limits
        if (history.length > 20) {
            history = history.slice(-20);
        }

        // Get AI response
        const response = await aiService.chat(message, userRole, userId, history);

        if (!response.success) {
            return res.status(500).json(response);
        }

        // Update conversation history
        history.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response.message }
        );
        conversationHistories.set(userId, history);

        // Return response
        res.json({
            success: true,
            message: response.message,
            model: response.model,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI chat endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process AI request',
            details: error.message
        });
    }
});

/**
 * DELETE /api/ai/chat/history
 * Clear conversation history for the current user
 */
router.delete('/chat/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;  // Changed from req.user.userId to req.user.id
        conversationHistories.delete(userId);

        res.json({
            success: true,
            message: 'Conversation history cleared'
        });
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear history',
            details: error.message
        });
    }
});

/**
 * GET /api/ai/status
 * Check if LMStudio is connected and ready
 */
router.get('/status', authenticateToken, async (req, res) => {
    try {
        // Try to connect to LMStudio
        const connected = await aiService.connectToLMStudio();

        res.json({
            success: true,
            connected,
            message: connected
                ? 'AI assistant is ready'
                : 'LMStudio is not running. Please start LMStudio and try again.'
        });
    } catch (error) {
        console.error('AI status check error:', error);
        res.json({
            success: false,
            connected: false,
            message: 'Failed to connect to LMStudio',
            details: error.message
        });
    }
});

module.exports = router;
