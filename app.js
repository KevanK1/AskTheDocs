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

// 1. Render the landing page with the current application session.
app.get('/', (req, res) => {
  const session = app.locals.activeSession;
  res.render('landing', { user: session?.user || null, message: null, authenticating: false });
});

// 2. Submit user email to trigger a passwordless sign-in link.
app.post('/auth/send-link', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) {
    return res.render('landing', { user: null, message: 'Please enter a valid email address.', authenticating: false });
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${req.protocol}://${req.get('host')}/`
    }
  });
  
  if (error) {
    return res.render('landing', { user: null, message: error.message, authenticating: false });
  }

  res.render('landing', { user: null, message: 'Check your inbox for your sign-in link.', authenticating: false });
});

// 3. Confirm the access token received from a Supabase email-link redirect.
app.post('/auth/verify-link', async (req, res) => {
  const token = req.body.token?.trim();

  try {
    if (!token) {
      return res.status(401).json({ error: 'Link session token is required.' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Link expired or invalid session state.' });
    }

    const { data: usage } = await supabase
      .from('user_usage')
      .select('prompt_count')
      .eq('user_id', user.id)
      .single();
    const usageCount = usage ? usage.prompt_count : 0;

    app.locals.activeSession = { user, token, usageCount };
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Server error during link processing:', err);
    return res.status(500).json({ error: 'Backend connection processing failure.' });
  }
});

// 4. Keep the active session available when navigating back to the landing page.
app.get('/tool', (req, res) => {
  if (app.locals.activeSession) {
    const { user, token, usageCount } = app.locals.activeSession;
    return res.render('tool', { user, token, usageCount, initialUrl: req.query.url || '' });
  }
  res.redirect('/');
});

app.get('/auth/logout', (req, res) => {
  app.locals.activeSession = null;
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
