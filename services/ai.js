const axios = require('axios');
require('dotenv').config();

function buildPrompt(extractedText, question) {
    return `You are given text extracted from a documentation or informational website.
Answer the user's question using ONLY this content.
If the answer is not present, clearly say so.
Keep the answer short and beginner-friendly.
Website Content:
${extractedText}
User Question:
${question}`;
}

async function askQuestion(extractedText, question) {
    const apiKey = process.env.AI_API_KEY;
    const apiUrl = process.env.AI_API_URL;

    if (!apiKey) {
        throw new Error('AI API key not configured');
    }
    if (!apiUrl) {
        throw new Error('AI API URL not configured');
    }

    const prompt = buildPrompt(extractedText, question);

    try {
        const response = await axios.post(
            `${apiUrl}?key=${apiKey}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 500
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        if (
            response.data.candidates &&
            response.data.candidates.length > 0 &&
            response.data.candidates[0].content &&
            response.data.candidates[0].content.parts &&
            response.data.candidates[0].content.parts.length > 0
        ) {
            const answer = response.data.candidates[0].content.parts[0].text.trim();
            return answer;
        }

        throw new Error('Gemini returned no response');

    } catch (err) {
        console.error('AI service error:', err.response?.data || err.message);
        throw new Error('AI service failed: ' + (err.response?.data?.error?.message || err.message));
    }
}

module.exports = { askQuestion };