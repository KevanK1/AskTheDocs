const express = require('express');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const askRoutes = require('./routes/ask');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/tool', (req, res) => {
  res.render('tool');
});


app.use('/api', askRoutes);


app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Something went wrong on our end. Please try again.'
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});