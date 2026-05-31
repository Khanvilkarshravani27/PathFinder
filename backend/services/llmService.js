const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================
// SYSTEM PROMPT — strict JSON contract for React to consume
// ============================================================

const SYSTEM_PROMPT = `You are 'PathFinder', an elite AI career routing agent with deep knowledge of software engineering skill trees.

You will receive a JSON object containing:
1. "target_role": The role the user wants to reach
2. "required_skills": Array of tech skills extracted from real job listings for that role
3. "github_repos": The user's actual repositories with languages and topics
4. "current_tasks": What the user is currently studying (from Notion, may be empty)

Your task:
1. Extract all unique technologies from github_repos (languages + topics)
2. Compare against required_skills
3. Identify what is MATCHED vs MISSING
4. Be SMART: if user knows React, don't tell them to learn Vue — suggest Next.js to advance
5. If user knows Node.js, suggest cloud deployment (AWS/Railway), not a new backend language
6. Factor in current_tasks: if they're already studying something, reference it

Return ONLY a valid JSON object matching this exact schema. No markdown. No prose. No code blocks:
{
  "summary": "2-sentence personalized summary of where the user stands",
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "user_current_stack": ["detected from repos"],
  "action_plan": [
    {
      "step": 1,
      "title": "Short actionable title (max 8 words)",
      "description": "Detailed explanation referencing their actual repos",
      "resource": "Specific tutorial/doc URL or book title",
      "estimated_hours": 15,
      "priority": "high"
    }
  ],
  "quick_wins": ["1 thing they can do today", "another quick win"],
  "timeline_estimate": "e.g. 8-12 weeks to be job-ready"
}

The action_plan must have exactly 3-5 steps ordered by priority.
Be specific — reference the user's actual repo names when relevant.`;

// ============================================================
// GAP ANALYSIS
// ============================================================

const analyzeGap = async ({ targetRole, requiredSkills, githubRepos, currentTasks }) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Deduplicate and aggregate skills from job listings
  const allRequired = [...new Set(requiredSkills.flatMap(j => j.tech_stack || []))];

  // Extract user's stack from GitHub
  const userStack = [
    ...new Set([
      ...githubRepos.map(r => r.primary_language).filter(Boolean),
      ...githubRepos.flatMap(r => r.repo_topics || [])
    ])
  ];

  const payload = {
    target_role: targetRole,
    required_skills: allRequired,
    github_repos: githubRepos.map(r => ({
      name: r.repo_name,
      language: r.primary_language,
      topics: r.repo_topics,
      stars: r.stars
    })),
    current_tasks: currentTasks.map(t => t.title)
  };

  console.log('\n🤖 Sending to Gemini...');
  console.log(`   Required skills: ${allRequired.length}`);
  console.log(`   User repos: ${githubRepos.length}`);

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: JSON.stringify(payload, null, 2) }
  ]);

  const text = result.response.text().trim();

  // Strip markdown code blocks if Gemini wraps them
  const cleaned = text
    .replace(/^```json\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Gemini returned invalid JSON:', cleaned);
    throw new Error('LLM returned invalid JSON. Retrying...');
  }
};

// ============================================================
// FOLLOW-UP CHAT
// ============================================================

const chatFollowUp = async ({ message, analysisContext }) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const chatPrompt = `You are PathFinder, a career routing AI. The user has already received their gap analysis:
${JSON.stringify(analysisContext, null, 2)}

The user is now asking a follow-up question. Answer helpfully and concisely (2-4 sentences max).
Reference their specific skills and action plan when relevant.

User question: ${message}`;

  const result = await model.generateContent([{ text: chatPrompt }]);
  return result.response.text().trim();
};

module.exports = { analyzeGap, chatFollowUp };
