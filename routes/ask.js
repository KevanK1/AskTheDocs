// POST /ask endpoint - handles documentation questions
// Orchestrates scraping and AI services to answer user questions

const express = require('express');
const router = express.Router();
const scraperService = require('../services/scraper');
const aiService = require('../services/ai');

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}
router.post('/ask', async (req, res) => {
    try {
        const { url, question } = req.body;
        if (!url || !question) {
            return res.status(400).json({
                error: 'Both URL and question are required'
            });
        }

        if (!isValidUrl(url)) {
            return res.status(400).json({
                error: 'Please provide a valid HTTP or HTTPS URL'
            });
        }

        if (question.trim().length < 3) {
            return res.status(400).json({
                error: 'Question must be at least 3 characters long'
            });
        }
        console.log('📥 Fetching content from:', url);
        const extractedText = await scraperService.scrapeUrl(url);

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                error: 'Could not extract readable content from the provided URL'
            });
        }

        console.log('🤖 Asking AI the question...');
        const answer = await aiService.askQuestion(extractedText, question);
        return res.json({ answer });

    } catch (error) {
        console.error('Error in /ask endpoint:', error.message);
        if (error.message.includes('fetch') || error.message.includes('network')) {
            return res.status(500).json({
                error: 'Failed to fetch the website. Please check the URL and try again.'
            });
        }

        if (error.message.includes('AI') || error.message.includes('API')) {
            return res.status(500).json({
                error: 'AI service is temporarily unavailable. Please try again later.'
            });
        }

        return res.status(500).json({
            error: 'An unexpected error occurred. Please try again.'
        });
    }
});


module.exports = router;
