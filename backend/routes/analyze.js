const express = require('express');
const router = express.Router();
const { fetchAnalysisData } = require('../services/coralService');
const { analyzeGap } = require('../services/llmService');

/**
 * POST /api/analyze
 * Body: { targetRole, githubUsername, notionDatabaseId? }
 * Returns: full gap analysis JSON
 */
router.post('/', async (req, res) => {
  const { targetRole, githubUsername, notionDatabaseId } = req.body;

  if (!targetRole || !targetRole.trim()) {
    return res.status(400).json({ error: 'targetRole is required' });
  }
  if (!githubUsername || !githubUsername.trim()) {
    return res.status(400).json({ error: 'githubUsername is required' });
  }

  try {
    console.log(`\n🚀 Analysis request: "${targetRole}" for @${githubUsername}`);

    // Step 1: Fetch data via Coral (or direct APIs)
    const { github, jobs, notion } = await fetchAnalysisData({
      targetRole: targetRole.trim(),
      githubUsername: githubUsername.trim(),
      notionDatabaseId: notionDatabaseId || process.env.NOTION_DATABASE_ID
    });

    if (github.length === 0) {
      return res.status(404).json({
        error: `No public repositories found for GitHub user "${githubUsername}". Check the username and make sure repos are public.`
      });
    }

    // Step 2: LLM gap analysis
    const analysis = await analyzeGap({
      targetRole,
      requiredSkills: jobs,
      githubRepos: github,
      currentTasks: notion
    });

    // Step 3: Return enriched response
    res.json({
      success: true,
      analysis,
      meta: {
        githubReposScanned: github.length,
        jobListingsAnalyzed: jobs.length,
        notionTasksFound: notion.length,
        coralMode: process.env.CORAL_MODE === 'true',
        generatedAt: new Date().toISOString()
      },
      rawData: {
        github: github.slice(0, 10), // send top 10 for UI display
        jobs: jobs.slice(0, 5)
      }
    });

  } catch (err) {
    console.error('Analysis error:', err.message);

    if (err.message.includes('GitHub')) {
      return res.status(502).json({ error: 'GitHub API error: ' + err.message });
    }
    if (err.message.includes('Gemini') || err.message.includes('LLM')) {
      return res.status(502).json({ error: 'AI analysis failed. Check GEMINI_API_KEY.' });
    }

    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
