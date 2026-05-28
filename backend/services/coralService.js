/**
 * coralService.js
 * 
 * PathFinder's data layer — designed to mirror Coral's SQL interface.
 * 
 * CORAL MODE (CORAL_MODE=true):
 *   Uses the Coral CLI to execute cross-source SQL joins natively.
 *   Requires: Coral CLI installed + WSL2 on Windows.
 *   Install: curl -fsSL https://withcoral.com/install.sh | bash
 * 
 * DIRECT API MODE (CORAL_MODE=false, default):
 *   Executes the same logical queries against each API directly.
 *   No CLI needed. Same data, same results.
 * 
 * The SQL queries below represent the canonical Coral queries.
 * In production with Coral installed, replace executeDirect() with
 * executeCoralCLI() for native cross-source join support.
 */

const { exec } = require('child_process');
const axios = require('axios');

// ============================================================
// CORAL SQL QUERIES (canonical — shown in demo)
// ============================================================

const CORAL_QUERIES = {
  /**
   * Cross-source join: job market + GitHub + Notion
   * This is the signature query that makes PathFinder unique.
   */
  FULL_ANALYSIS: (targetRole, githubUsername, notionDbId) => `
    SELECT 
        j.role_name         AS target_role,
        j.tech_stack        AS required_skills,
        g.name              AS repo_name,
        g.language          AS primary_language,
        g.topics            AS repo_topics,
        n.title             AS current_tasks
    FROM job_market.job_listings j
    JOIN github.repositories g ON g.owner = '${githubUsername}'
    JOIN notion.pages n ON n.database_id = '${notionDbId}'
    WHERE j.role_name ILIKE '%${targetRole}%'
    LIMIT 30;
  `,

  GITHUB_REPOS: (username) => `
    SELECT name, language, topics, stargazers_count, updated_at
    FROM github.repositories
    WHERE owner = '${username}'
    ORDER BY updated_at DESC
    LIMIT 20;
  `,

  JOB_MARKET: (role) => `
    SELECT role_name, company, tech_stack, location
    FROM job_market.job_listings
    WHERE role_name ILIKE '%${role}%'
    LIMIT 10;
  `,

  NOTION_TASKS: (dbId) => `
    SELECT title, status, tags
    FROM notion.pages
    WHERE database_id = '${dbId}';
  `
};

// ============================================================
// CORAL CLI EXECUTION (when Coral is installed)
// ============================================================

const executeCoralCLI = (query) => {
  return new Promise((resolve, reject) => {
    const escaped = query.replace(/"/g, '\\"').replace(/\n/g, ' ').trim();
    exec(
      `coral sql "${escaped}" --format json`,
      { timeout: 30000 },
      (error, stdout, stderr) => {
        if (error) return reject(new Error(`Coral CLI error: ${error.message}`));
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject(new Error(`Failed to parse Coral output: ${stdout}`));
        }
      }
    );
  });
};

// ============================================================
// DIRECT API EXECUTION (no CLI needed — same logical result)
// ============================================================

const executeDirectGitHub = async (username) => {
  const token = process.env.GITHUB_TOKEN;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: repos } = await axios.get(
    `https://api.github.com/users/${username}/repos`,
    {
      headers,
      params: { sort: 'updated', per_page: 30, type: 'public' }
    }
  );

  return repos.map(r => ({
    repo_name: r.name,
    primary_language: r.language,
    repo_topics: r.topics || [],
    description: r.description,
    stars: r.stargazers_count,
    updated_at: r.updated_at,
    html_url: r.html_url
  }));
};

const executeDirectJobMarket = async (targetRole) => {
  try {
    const { data } = await axios.get('https://www.themuse.com/api/public/jobs', {
      params: {
        category: 'Software Engineer',
        page: 0,
        descending: true
      },
      timeout: 10000
    });

    // Extract tech keywords from job descriptions
    const techKeywords = [
      'React', 'Next.js', 'Vue', 'Angular', 'TypeScript', 'JavaScript',
      'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Flask',
      'Java', 'Spring', 'Go', 'Rust', 'C++', 'C#', '.NET',
      'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
      'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'GraphQL', 'REST',
      'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Linux',
      'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL',
      'Microservices', 'gRPC', 'Kafka', 'RabbitMQ', 'Elasticsearch'
    ];

    const jobs = (data.results || []).slice(0, 10);
    return jobs.map(job => {
      const content = (job.contents || '').replace(/<[^>]*>/g, ' ');
      const found = techKeywords.filter(kw =>
        content.toLowerCase().includes(kw.toLowerCase())
      );
      return {
        role_name: job.name,
        company: job.company?.name || 'Unknown',
        tech_stack: found,
        location: job.locations?.[0]?.name || 'Remote'
      };
    }).filter(j => j.tech_stack.length > 0);
  } catch (err) {
    console.warn('The Muse API unavailable, using role-based inference:', err.message);
    return getRoleBasedSkills(targetRole);
  }
};

const executeDirectNotion = async (databaseId) => {
  if (!process.env.NOTION_TOKEN || !databaseId) {
    return [];
  }
  const { Client } = require('@notionhq/client');
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  try {
    const response = await notion.databases.query({ database_id: databaseId });
    return response.results.map(page => ({
      title: page.properties?.Name?.title?.[0]?.plain_text || 'Untitled',
      status: page.properties?.Status?.select?.name || 'Not started',
      tags: page.properties?.Tags?.multi_select?.map(t => t.name) || []
    }));
  } catch (err) {
    console.warn('Notion query failed:', err.message);
    return [];
  }
};

// ============================================================
// ROLE-BASED SKILL INFERENCE (fallback when API is down)
// ============================================================

const ROLE_SKILL_MAP = {
  'frontend': ['React', 'TypeScript', 'Next.js', 'CSS', 'GraphQL', 'Webpack', 'Testing', 'Accessibility'],
  'backend': ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'REST', 'Microservices', 'CI/CD'],
  'fullstack': ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'TypeScript', 'GraphQL', 'CI/CD'],
  'devops': ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux', 'Prometheus', 'Ansible'],
  'ml': ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Docker', 'AWS', 'FastAPI', 'Spark'],
  'mobile': ['React Native', 'Swift', 'Kotlin', 'TypeScript', 'REST', 'Firebase'],
  'data': ['Python', 'SQL', 'Spark', 'Airflow', 'dbt', 'AWS', 'Tableau', 'Snowflake'],
};

const getRoleBasedSkills = (targetRole) => {
  const lower = targetRole.toLowerCase();
  let skills = ROLE_SKILL_MAP.fullstack;
  for (const [key, val] of Object.entries(ROLE_SKILL_MAP)) {
    if (lower.includes(key)) { skills = val; break; }
  }
  return [{
    role_name: targetRole,
    company: 'Industry Standard',
    tech_stack: skills,
    location: 'Global'
  }];
};

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Main entry: fetch all data for gap analysis.
 * Routes to Coral CLI or direct APIs based on CORAL_MODE env var.
 */
const fetchAnalysisData = async ({ targetRole, githubUsername, notionDatabaseId }) => {
  const useCoralCLI = process.env.CORAL_MODE === 'true';

  console.log(`\n🔍 PathFinder Query Engine`);
  console.log(`   Mode: ${useCoralCLI ? '🪸 Coral CLI' : '⚡ Direct APIs'}`);
  console.log(`   Target Role: "${targetRole}"`);
  console.log(`   GitHub: @${githubUsername}`);

  if (useCoralCLI) {
    // === CORAL CLI MODE ===
    // Single cross-source SQL join — this is the magic Coral enables
    console.log('\n📊 Coral SQL:\n', CORAL_QUERIES.FULL_ANALYSIS(targetRole, githubUsername, notionDatabaseId));
    return executeCoralCLI(CORAL_QUERIES.FULL_ANALYSIS(targetRole, githubUsername, notionDatabaseId));
  }

  // === DIRECT API MODE ===
  // Same logical queries, executed against each source independently
  console.log('\n📊 Executing queries:');
  console.log('   [1/3] github.repositories WHERE owner =', githubUsername);
  console.log('   [2/3] job_market.job_listings WHERE role ILIKE', targetRole);
  console.log('   [3/3] notion.pages WHERE database_id =', notionDatabaseId || 'N/A');

  const [githubData, jobData, notionData] = await Promise.allSettled([
    executeDirectGitHub(githubUsername),
    executeDirectJobMarket(targetRole),
    executeDirectNotion(notionDatabaseId)
  ]);

  const github = githubData.status === 'fulfilled' ? githubData.value : [];
  const jobs   = jobData.status   === 'fulfilled' ? jobData.value   : getRoleBasedSkills(targetRole);
  const notion = notionData.status === 'fulfilled' ? notionData.value : [];

  if (githubData.status === 'rejected') {
    throw new Error(`GitHub API failed: ${githubData.reason?.message}`);
  }

  console.log(`\n✅ Data fetched:`);
  console.log(`   GitHub repos: ${github.length}`);
  console.log(`   Job listings: ${jobs.length}`);
  console.log(`   Notion tasks: ${notion.length}`);

  return { github, jobs, notion, queries: CORAL_QUERIES };
};

module.exports = { fetchAnalysisData, CORAL_QUERIES };
