const express = require('express');
const router = express.Router();
const { pushTaskToNotion, createStudyTrackerDatabase } = require('../services/notionService');

/**
 * POST /api/notion/task
 * Pushes a single action plan step to Notion
 */
router.post('/task', async (req, res) => {
  const { databaseId, title, description, priority, estimatedHours } = req.body;
  const dbId = databaseId || process.env.NOTION_DATABASE_ID;

  if (!dbId) {
    return res.status(400).json({
      error: 'No Notion database ID. Run setup script or provide databaseId in request body.'
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

/**
 * POST /api/notion/setup
 * Creates the PathFinder Study Tracker database in a given Notion page.
 * Body: { pageId: "32-char-hex-notion-page-id" }
 */
router.post('/setup', async (req, res) => {
  const { pageId } = req.body;

  if (!pageId) {
    return res.status(400).json({ error: 'pageId is required in the request body.' });
  }

  if (!process.env.NOTION_TOKEN) {
    return res.status(400).json({ error: 'NOTION_TOKEN not set in backend/.env' });
  }

  try {
    const databaseId = await createStudyTrackerDatabase(pageId);
    console.log(`✅ Notion DB created via API: ${databaseId}`);
    res.json({ success: true, databaseId });
  } catch (err) {
    console.error('Notion setup error:', err.message);
    const hint = err.message.includes('Could not find page')
      ? 'Share the Notion page with your integration via ... → Connections → Add connections.'
      : err.message;
    res.status(500).json({ error: hint });
  }
});

/**
 * GET /api/notion/status
 * Check if Notion is configured correctly
 */
router.get('/status', async (req, res) => {
  const hasToken = !!process.env.NOTION_TOKEN;
  const hasDbId = !!process.env.NOTION_DATABASE_ID;

  if (!hasToken) {
    return res.json({ configured: false, reason: 'NOTION_TOKEN not set' });
  }

  if (!hasDbId) {
    return res.json({ configured: false, reason: 'NOTION_DATABASE_ID not set. Run setup.' });
  }

  // Try to query the database to verify access
  try {
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    await notion.databases.retrieve({ database_id: process.env.NOTION_DATABASE_ID });
    res.json({ configured: true, databaseId: process.env.NOTION_DATABASE_ID });
  } catch (err) {
    res.json({ configured: false, reason: err.message });
  }
});

module.exports = router;
