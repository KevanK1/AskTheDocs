# AskTheDocs - Quick Setup Guide

## ⚡ Quick Start (3 Steps)

### 1. Install Dependencies

Dependencies are already installed! ✅

If you need to reinstall:
```bash
npm install
```

### 2. Configure Your AI API

Copy the example environment file:
```bash
copy .env.example .env
```

Then edit `.env` and add your AI API credentials:

**For Google AI (Gemini) - Recommended:**
```env
PORT=3000
AI_API_KEY=your-google-ai-key-here
AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
AI_MODEL=gemini-1.5-flash
```

**For OpenAI:**
```env
PORT=3000
AI_API_KEY=sk-your-openai-api-key-here
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-3.5-turbo
```

> **Note:** You'll need to get an API key from your chosen provider:
> - Google AI (Gemini): https://makersuite.google.com/app/apikey
> - OpenAI: https://platform.openai.com/api-keys

### 3. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 4. Open Your Browser

Visit: `http://localhost:3000`

---

## 🧪 Testing the Application

### Example URLs to Try:
- Express.js: `https://expressjs.com/en/starter/installing.html`
- React: `https://react.dev/learn`
- MDN Web Docs: `https://developer.mozilla.org/en-US/docs/Web/JavaScript`

### Example Questions:
- "How do I install Express?"
- "What is a component?"
- "How do I declare a variable?"

---

## 🎯 Project Features

✅ **Backend-First Design** - Clean API architecture  
✅ **Web Scraping** - Extracts readable content from any URL  
✅ **AI Integration** - Controlled prompting for accurate answers  
✅ **Modern UI** - Dark theme, smooth animations, responsive design  
✅ **Error Handling** - User-friendly error messages  
✅ **Security** - Helmet middleware for HTTP security  
✅ **No Database** - Simple, stateless design  
✅ **No Authentication** - Perfect for demos and portfolios  

---

## 📂 Project Structure

```
AskTheDocs/
├── app.js                    # Express app with security
├── routes/ask.js             # POST /api/ask endpoint
├── services/
│   ├── scraper.js           # Web scraping (Axios + Cheerio)
│   └── ai.js                # AI integration
├── views/
│   ├── landing.ejs          # Landing page
│   └── tool.ejs             # Main tool
├── public/
│   ├── css/style.css        # Modern dark theme
│   └── js/tool.js           # Client-side logic
└── README.md                # Full documentation
```

---

## 🔧 API Reference

### POST `/api/ask`

**Request:**
```json
{
  "url": "https://example.com/docs",
  "question": "How do I get started?"
}
```

**Response (Success):**
```json
{
  "answer": "To get started, first install the package..."
}
```

**Response (Error):**
```json
{
  "error": "Failed to fetch the website. Please check the URL."
}
```

---

## 🎓 Interview Tips

When discussing this project:

1. **Architecture**: Explain the separation of concerns (routes → services)
2. **Web Scraping**: How Cheerio extracts clean content
3. **AI Integration**: Controlled prompting strategy
4. **Error Handling**: Layered error handling approach
5. **Security**: Helmet middleware and input validation
6. **Scalability**: How you'd add caching, rate limiting, etc.

---

## 🚨 Troubleshooting

### "npm install" fails
Try: `powershell -ExecutionPolicy Bypass -Command "npm install"`

### "AI API key not configured"
Make sure you've created a `.env` file based on `.env.example`

### "Failed to fetch website"
- Check if the URL is accessible
- Some websites block scrapers - try documentation sites instead

### "AI service failed"
- Verify your API key is correct
- Check your API quota/credits
- Ensure the API URL matches your provider

---

## 📖 Full Documentation

See [README.md](./README.md) for complete project documentation.

---

**Ready to use!** 🚀

Just configure your `.env` file and run `npm start`
