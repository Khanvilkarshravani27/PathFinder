const express = require('express');
const router = express.Router();
const { pushTaskToNotion } = require('../services/notionService');

/**
 * POST /api/notion/task
 * Pushes a single action plan step to Notion
 */
router.post('/task', async (req, res) => {
  const { databaseId, title, description, priority, estimatedHours } = req.body;
  const dbId = databaseId || process.env.NOTION_DATABASE_ID;

  if (!dbId) {
    return res.status(400).json({
      error: 'No Notion database ID. Run setup script or provide NOTION_DATABASE_ID in .env'
    });
  }

  try {
    const pageId = await pushTaskToNotion({ databaseId: dbId, title, description, priority, estimatedHours });
    res.json({ success: true, notionPageId: pageId });
  } catch (err) {
    console.error('Notion push error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
