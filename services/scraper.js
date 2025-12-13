const axios = require('axios');
const cheerio = require('cheerio');

const MAX_TEXT_LENGTH = 35000;

async function scrapeUrl(url) {
    try {

        const response = await axios.get(url, {
            timeout: 40000, 
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;

        const $ = cheerio.load(html);

        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('header').remove();
        $('footer').remove();
        $('iframe').remove();
        $('noscript').remove();
        $('.advertisement').remove();
        $('.ads').remove();
        $('.sidebar').remove();

        let text = '';
        const mainSelectors = ['main', 'article', '.content', '.documentation', '#content'];

        for (const selector of mainSelectors) {
            const mainContent = $(selector);
            if (mainContent.length > 0) {
                text = mainContent.text();
                break;
            }
        }

        if (!text) {
            text = $('body').text();
        }

        text = text
            .replace(/\s+/g, ' ')  
            .replace(/\n+/g, '\n')
            .trim();

        if (text.length > MAX_TEXT_LENGTH) {
            text = text.substring(0, MAX_TEXT_LENGTH) + '...';
            console.log(`Text truncated to ${MAX_TEXT_LENGTH} characters`);
        }

        console.log(`Extracted ${text.length} characters from ${url}`);
        return text;

    } catch (error) {
        console.error('Scraping error:', error.message);

        if (error.code === 'ENOTFOUND') {
            throw new Error('Website not found. Please check the URL.');
        }

        if (error.code === 'ETIMEDOUT') {
            throw new Error('Request timed out. The website took too long to respond.');
        }

        throw new Error('Failed to fetch website content: ' + error.message);
    }
}

module.exports = {
    scrapeUrl
};
