// Main Express application for AskTheDocs
// A backend-focused tool to ask questions about documentation using AI

const express = require('express');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const askRoutes = require('./routes/ask');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - adds various HTTP headers for protection
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for simplicity in development
}));

// Body parsing middleware - handles JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup - EJS for minimal frontend wrapper
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files - CSS, JS, images
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/tool', (req, res) => {
  res.render('tool');
});

// API Routes
app.use('/api', askRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Something went wrong on our end. Please try again.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AskTheDocs server running on http://localhost:${PORT}`);
  console.log(`📖 Visit the landing page at http://localhost:${PORT}`);
  console.log(`🔧 Use the tool at http://localhost:${PORT}/tool`);
});
