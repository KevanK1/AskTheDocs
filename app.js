const express = require('express');
const helmet = require('helmet');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const askRoutes = require('./routes/ask');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase using your hidden dashboard environment keys
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Share this database instance across your other dynamic routing layers
app.locals.supabase = supabase;

app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 1. Clean Anonymous Landing View Route
app.get('/', (req, res) => {
  res.render('landing', { user: null, message: null, step: null });
});

// 2. Submit user email to trigger the 6-digit OTP delivery
app.post('/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  const { error } = await supabase.auth.signInWithOtp({ email });
  
  if (error) {
    return res.render('landing', { message: error.message, step: null });
  }
  
  res.render('landing', { step: 'verify', email: email, message: 'OTP Token dispatched to your inbox!' });
});

// 3. Confirm target authentication token check input payload
app.post('/auth/verify-otp', async (req, res) => {
  const { email, otpToken } = req.body;
  const { data, error } = await supabase.auth.verifyOtp({ email, token: otpToken, type: 'email' });
  
  if (error || !data.session) {
    return res.render('landing', { message: 'Invalid or expired OTP token confirmation failure.', step: null });
  }
  
  // Query tracking metrics row details from database table
  let { data: usage } = await supabase.from('user_usage').select('prompt_count').eq('user_id', data.user.id).single();
  let usageCount = usage ? usage.prompt_count : 0;

  // Pass user authorization context payload down cleanly straight into the tool view workspace dashboard
  res.render('tool', { 
    user: data.user, 
    token: data.session.access_token, 
    usageCount: usageCount 
  });
});

// Block direct unauthenticated access to the workspace page
app.get('/tool', (req, res) => {
  res.redirect('/');
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


// const express = require('express');
// const helmet = require('helmet');
// const path = require('path');
// require('dotenv').config();

// const askRoutes = require('./routes/ask');

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(helmet({
//   contentSecurityPolicy: false,
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(path.join(__dirname, 'public')));


// app.get('/', (req, res) => {
//   res.render('landing');
// });

// app.get('/tool', (req, res) => {
//   res.render('tool');
// });


// app.use('/api', askRoutes);


// app.use((req, res) => {
//   res.status(404).json({ error: 'Endpoint not found' });
// });

// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
//   res.status(500).json({
//     error: 'Something went wrong on our end. Please try again.'
//   });
// });

// app.listen(PORT, () => {
//   console.log(`http://localhost:${PORT}`);
// });