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

// 3. Confirm authentication access token payload for code or email-link logins
app.post('/auth/verify-otp', async (req, res) => {
  const isLinkRedirect = req.body.isLinkRedirect === true || req.body.isLinkRedirect === 'true';
  const token = req.body.token?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const otpToken = req.body.otpToken?.trim();

  let sessionToken = token;
  let activeUser = null;

  try {
    if (isLinkRedirect) {
      if (!sessionToken) {
        return res.status(401).json({ error: 'Link session token is required.' });
      }

      const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
      if (error || !user) {
        return res.status(401).json({ error: 'Link expired or invalid session state.' });
      }
      activeUser = user;
    } else {
      if (!email || !otpToken) {
        return res.render('landing', { user: null, message: 'Enter the validation code.', step: 'verify', email });
      }

      const { data, error } = await supabase.auth.verifyOtp({ email, token: otpToken, type: 'email' });
      if (error || !data.session) {
        return res.render('landing', { user: null, message: error?.message || 'Invalid passcode.', step: 'verify', email });
      }
      activeUser = data.user;
      sessionToken = data.session.access_token;
    }

    const { data: usage } = await supabase
      .from('user_usage')
      .select('prompt_count')
      .eq('user_id', activeUser.id)
      .single();
    const usageCount = usage ? usage.prompt_count : 0;

    if (isLinkRedirect) {
      app.locals.activeSession = { user: activeUser, token: sessionToken, usageCount };
      return res.status(200).json({ status: 'success' });
    }

    return res.render('tool', { user: activeUser, token: sessionToken, usageCount });
  } catch (err) {
    console.error('Server error during code processing:', err);
    return isLinkRedirect
      ? res.status(500).json({ error: 'Backend connection processing failure.' })
      : res.render('landing', { user: null, message: 'System processing error context.', step: null });
  }
});

// Clean workspace gate for link-based logins
app.get('/tool', (req, res) => {
  if (app.locals.activeSession) {
    const { user, token, usageCount } = app.locals.activeSession;
    app.locals.activeSession = null;
    return res.render('tool', { user, token, usageCount });
  }
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
