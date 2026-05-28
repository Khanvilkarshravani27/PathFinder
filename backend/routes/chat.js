const express = require('express');
const router = express.Router();
const { chatFollowUp } = require('../services/llmService');

/**
 * POST /api/chat
 * Body: { message, analysisContext }
 */
router.post('/', async (req, res) => {
  const { message, analysisContext } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  try {
    const reply = await chatFollowUp({ message, analysisContext });
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
