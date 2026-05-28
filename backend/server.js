require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notion', require('./routes/notion'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    coralMode: process.env.CORAL_MODE === 'true',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n🧭 PathFinder Backend running on http://localhost:${PORT}`);
  console.log(`   Coral Mode: ${process.env.CORAL_MODE === 'true' ? '✅ Active' : '⚡ Direct API Mode'}`);
  console.log(`   Frontend:   ${process.env.FRONTEND_URL}\n`);
});
