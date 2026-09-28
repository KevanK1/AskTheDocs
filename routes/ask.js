// POST /ask endpoint - handles documentation questions with 3-prompt limits tracking
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
        // 1. Grab token alongside the input params from the request payload
        const { url, question, token } = req.body;
        
        // Access the shared database client instance attached in app.js
        const supabase = req.app.locals.supabase;

        if (!token) {
            return res.status(401).json({ error: 'Authentication session token required.' });
        }
        if (!url || !question) {
            return res.status(400).json({ error: 'Both URL and question are required' });
        }
        if (!isValidUrl(url)) {
            return res.status(400).json({ error: 'Please provide a valid HTTP or HTTPS URL' });
        }
        if (question.trim().length < 3) {
            return res.status(400).json({ error: 'Question must be at least 3 characters long' });
        }

        // 2. Authenticate the active user token via Supabase Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
        }

        // 3. Fetch prompt tracking metrics row records
        let { data: usage } = await supabase
            .from('user_usage')
            .select('prompt_count')
            .eq('user_id', user.id)
            .single();

        let currentCount = usage ? usage.prompt_count : 0;

        // 4. Enforce strict anti-abuse limits threshold check
        if (currentCount >= 3) {
            return res.status(429).json({ error: 'Demo limit reached! You have consumed your 3 sandbox trials.' });
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

        // 5. Update and increment usage stats inside the database table securely
        await supabase
            .from('user_usage')
            .upsert({
                user_id: user.id,
                email: user.email,
                prompt_count: currentCount + 1
            });

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
