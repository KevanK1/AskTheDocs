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
    const baseUrl = process.env.AI_API_URL;
    const model = process.env.AI_MODEL;

    if (!apiKey) {
        throw new Error('AI API key not configured');
    }
    if (!baseUrl) {
        throw new Error('AI API URL not configured');
    }

    const prompt = buildPrompt(extractedText, question);

    try {
        const response = await axios.post(
            `${baseUrl.replace(/\/$/, '')}/chat/completions`,
            {
                model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                },
                timeout: 30000
            }
        );

        if (
            response.data.choices &&
            response.data.choices.length > 0 &&
            response.data.choices[0].message &&
            response.data.choices[0].message.content
        ) {
            const answer = response.data.choices[0].message.content.trim();
            return answer;
        }

        throw new Error('AI provider returned no response');

    } catch (err) {
        console.error('AI service error:', err.response?.data || err.message);
        throw new Error('AI service failed: ' + (err.response?.data?.error?.message || err.message));
    }
}

module.exports = { askQuestion };