# 🧭 PathFinder — AI Career Routing Agent

> **WeMakeDevs "Pirates of the Coral-bean" Hackathon 2026 | Track 2: Personal Agent**

PathFinder is an AI-powered personal agent that eliminates career paralysis for developers. It reads your **actual GitHub repositories**, cross-references **real job listings**, and generates a hyper-personalized skill gap analysis and roadmap — all powered by a single **Coral SQL cross-source join**.

---

## ✨ What Makes This Special

Most career tools give generic advice. PathFinder reads **your code**.

```sql
-- The one query that powers it all
SELECT 
    j.tech_stack        AS required_skills,
    g.language          AS my_current_stack,
    g.name              AS repo_name,
    n.title             AS current_tasks
FROM job_market.job_listings j
JOIN github.repositories g ON g.owner = 'your-username'
JOIN notion.pages n ON n.database_id = 'your-db-id'
WHERE j.role_name ILIKE '%Backend Engineer%';
```

Three live data sources. One query. Zero API wrapper boilerplate.

---

## 🏗️ Architecture

```
Frontend (React + Vite)     Backend (Node.js + Express)     Data Layer
┌─────────────────────┐     ┌──────────────────────────┐     ┌──────────────┐
│  HeroSection        │────▶│  POST /api/analyze        │────▶│  GitHub API  │
│  LoadingTerminal    │     │  ├── coralService.js      │     │  The Muse    │
│  Dashboard          │     │  ├── llmService.js        │     │  Notion API  │
│  SkillComparison    │     │  └── notionService.js     │     └──────────────┘
│  ActionTimeline     │◀────│                           │
│  AgentChat          │     │  POST /api/chat           │     ┌──────────────┐
└─────────────────────┘     │  POST /api/notion/task    │────▶│  Gemini 1.5  │
                             └──────────────────────────┘     └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- GitHub Personal Access Token
- Gemini API Key (free at ai.google.dev)
- Notion Integration Token (optional but recommended)

### 1. Clone & Install

```bash
git clone https://github.com/Khanvilkarshravani27/PathFinder.git
cd PathFinder

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env and fill in your API keys
```

Required keys:
- `GEMINI_API_KEY` → [ai.google.dev](https://ai.google.dev)
- `GITHUB_TOKEN` → [github.com/settings/tokens](https://github.com/settings/tokens) (scopes: `repo`, `user`)

### 3. Set Up Notion (Optional)

```bash
# Create the Study Tracker database automatically
node backend/scripts/setupNotion.js YOUR_NOTION_PAGE_ID
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🪸 Coral Integration

This project uses [Coral](https://github.com/withcoral/coral) — an open-source SQL runtime for agents.

**Install Coral CLI:**
```bash
# Mac/Linux
brew install withcoral/tap/coral

# Or via bash script
curl -fsSL https://withcoral.com/install.sh | bash
```

**Enable Coral mode:**
```bash
# In backend/.env
CORAL_MODE=true
```

**Custom Source Spec:** We've written a custom Coral source spec for The Muse Jobs API. See [`coral-sources/job-market.yaml`](./coral-sources/job-market.yaml).

---

## 📁 Project Structure

```
PathFinder/
├── frontend/                # Vite + React + CSS Modules
│   └── src/
│       ├── components/
│       │   ├── HeroSection.jsx        # Landing + input form
│       │   ├── LoadingTerminal.jsx    # Animated Coral query display
│       │   ├── Dashboard.jsx          # Main results view
│       │   ├── SkillComparison.jsx    # Matched vs missing skills
│       │   ├── ActionPlanTimeline.jsx # Roadmap steps + Notion push
│       │   └── AgentChat.jsx          # Follow-up Q&A with Gemini
│       └── App.jsx
├── backend/                 # Node.js + Express
│   ├── services/
│   │   ├── coralService.js   # Coral CLI + Direct API dual mode
│   │   ├── llmService.js     # Gemini gap analysis
│   │   └── notionService.js  # Push tasks to Notion
│   ├── routes/
│   │   ├── analyze.js        # POST /api/analyze
│   │   ├── chat.js           # POST /api/chat
│   │   └── notion.js         # POST /api/notion/task
│   ├── scripts/
│   │   └── setupNotion.js    # One-time Notion DB setup
│   └── Dockerfile
├── coral-sources/
│   └── job-market.yaml       # Custom Coral source spec
└── README.md
```

---

## 🎯 Hackathon Bounties Targeted

| Bounty | Strategy |
|--------|----------|
| 🥇 Best Personal Agent (iPads) | Cross-source Coral join across 3 live data sources |
| 💰 $100 Cash | PR merging `job-market.yaml` to `withcoral/coral` |
| 🎁 Showcase Bounty | Post demo to Discord + LinkedIn |
| ⌨️ Keyboard Bounty | Technical blog post on Hashnode |

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, CSS Modules
- **Backend**: Node.js, Express
- **Data Layer**: Coral SQL (withcoral/coral)
- **AI**: Google Gemini 1.5 Flash
- **Integrations**: GitHub REST API, The Muse Jobs API, Notion API
- **Deployment**: Vercel (frontend) + Railway (backend)

---

## 📄 License

MIT — built for the WeMakeDevs hackathon.
