
> Ask questions about documentation without copy-pasting

A backend-focused mini project that allows users to paste a documentation/blog/info-site URL and ask questions about it using AI.

<img width="1900" height="874" alt="image" src="https://github.com/user-attachments/assets/ced8117a-7629-4855-ac0d-b8f5a34a073a" />

> Live link : askthedocs-kevan.up.railway.app

## 🎯 Project Overview

AskTheDocs is a clean, minimal backend project built to demonstrate:
- RESTful API design
- Web scraping techniques
- AI API integration
- Clean code architecture
- Error handling best practices


**Perfect for coding interviews and portfolio projects.**

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Web Scraping**: Axios + Cheerio
- **Security**: Helmet
- **View Engine**: EJS (minimal frontend wrapper)
- **AI Integration**: Configurable (OpenAI, Google AI, etc.)

## 📁 Project Structure

```
AskTheDocs/
├── app.js                 # Main Express application
├── routes/
│   └── ask.js            # POST /api/ask endpoint
├── services/
│   ├── scraper.js        # Web scraping service
│   └── ai.js             # AI service
├── views/
│   ├── landing.ejs       # Landing page
│   └── tool.ejs          # Main tool page
├── public/
│   ├── css/
│   │   └── style.css     # Modern styling
│   └── js/
│       └── tool.js       # Client-side logic
├── .env.example          # Environment variables template
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- An AI API key (OpenAI, Google AI, or compatible)

### Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your API key:
   ```env
   PORT=3000
   AI_API_KEY=your_api_key_here
   AI_API_URL=https://api.openai.com/v1/chat/completions
   AI_MODEL=gpt-3.5-turbo
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Landing page: `http://localhost:3000`
   - Tool page: `http://localhost:3000/tool`

## 📖 How It Works

1. **User inputs a documentation URL and a question**
2. **Scraper service fetches and extracts clean text** from the URL
3. **AI service sends the extracted content + question** to the AI API
4. **AI returns an answer** based strictly on the documentation content
5. **User receives the answer** in a clean, readable format

## 🔧 API Endpoints

### POST `/api/ask`

Request:
```json
{
  "url": "https://example.com/docs",
  "question": "How do I install this?"
}
```

Response (Success):
```json
{
  "answer": "To install, run npm install example-package..."
}
```

Response (Error):
```json
{
  "error": "Failed to fetch the website. Please check the URL and try again."
}
```

## 🎨 Design Principles

- **Backend-first**: Focus on clean API design and service architecture
- **No database**: Single request-response flow
- **No authentication**: Keeps the project simple and interview-safe
- **Clean code**: Well-commented, easy to explain
- **Error handling**: User-friendly error messages

## 🔒 Security Features

- Helmet middleware for HTTP security headers
- Input validation
- URL validation
- Request timeouts
- No sensitive data storage

## 🧪 Testing the Application

Try with these example documentation sites:
- Express.js Docs: `https://expressjs.com/en/starter/installing.html`
- React Docs: `https://react.dev/learn`
- Node.js Docs: `https://nodejs.org/en/docs/`

Example questions:
- "How do I install Express?"
- "What is JSX?"
- "How do I create a server in Node.js?"

## 🎓 Interview Talking Points

When discussing this project in interviews, highlight:

1. **Clean Architecture**: Separation of concerns (routes, services, views)
2. **Error Handling**: Comprehensive error handling at each layer
3. **API Design**: RESTful endpoint design with proper validation
4. **Web Scraping**: Smart content extraction using Cheerio
5. **AI Integration**: Controlled prompting for reliable answers
6. **Security**: Helmet middleware and input validation
7. **Scalability considerations**: Easy to add caching, rate limiting, etc.

## 🔮 Potential Extensions (Not Implemented)

If asked "How would you extend this?", mention:
- Add caching (Redis) for frequently accessed URLs
- Rate limiting to prevent abuse
- Support for PDFs and other document formats
- Conversation history (with database)
- User authentication for personalized experience
- Vector embeddings for more accurate answers

**Note**: The current version intentionally avoids these to maintain simplicity and interview-friendliness.

## 📝 License

ISC

## 🤝 Contributing

This is a portfolio/learning project. Feel free to fork and modify for your own use!

---

Built with ❤️ for learning and interviews
