const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const telegramRoutes = require('./routes/telegram');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Telegram configuration - store in app.locals for access across routes
app.locals.apiId = parseInt(process.env.TELEGRAM_API_ID) || 27038327;
app.locals.apiHash = process.env.TELEGRAM_API_HASH || "01a5af57f06745c055c1a06ee4a17202";
app.locals.client = null;
app.locals.isAuthenticated = false;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Telegram Sentiment API is running' });
});

// Use route modules
app.use('/api', authRoutes);
app.use('/api', telegramRoutes);

// Start server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
}); 