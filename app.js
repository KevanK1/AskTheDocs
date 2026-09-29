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
  const email = req.body.email?.trim().toLowerCase();
  if (!email) {
    return res.render('landing', { user: null, message: 'Please enter a valid email address.', step: null });
  }

  // 🛡️ FIX: Force the standard system to bypass Magic Links and deploy a text token string
  const { error } = await supabase.auth.signInWithOtp({ 
    email,
    options: {
      shouldCreateUser: true
    }
  });
  
  if (error) {
    return res.render('landing', { user: null, message: error.message, step: null });
  }
  
  res.render('landing', { user: null, step: 'verify', email, message: 'A 6-digit verification code was sent to your inbox.' });
});

// 3. Confirm target authentication token check input payload
app.post('/auth/verify-otp', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const otpToken = req.body.otpToken?.trim();
  if (!email || !otpToken) {
    return res.render('landing', { user: null, message: 'Enter the verification code from your email.', step: 'verify', email });
  }

  // 🛡️ FIX: Standardize type parameter checking sequence for pure text numbers verification
  const { data, error } = await supabase.auth.verifyOtp({ 
    email, 
    token: otpToken, 
    type: 'email' // Standardized to natively check both signups and magiclink OTP text tokens
  });
  
  if (error || !data.session) {
    return res.render('landing', { user: null, message: error?.message || 'Invalid or expired verification code.', step: 'verify', email });
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
