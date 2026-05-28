import { useState } from 'react';
import styles from './HeroSection.module.css';

const ROLE_SUGGESTIONS = [
  'Senior Backend Engineer at Stripe',
  'Full Stack Developer at Vercel',
  'DevOps Engineer at Netflix',
  'Frontend Engineer at Linear',
  'ML Engineer at Hugging Face',
  'Platform Engineer at Cloudflare',
  'Software Engineer at Google',
];

export default function HeroSection({ onAnalyze, error }) {
  const [targetRole, setTargetRole] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetRole.trim() || !githubUsername.trim()) return;
    setLoading(true);
    await onAnalyze({ targetRole, githubUsername });
    setLoading(false);
  };

  const fillSuggestion = (role) => setTargetRole(role);

  return (
    <div className={styles.hero}>
      {/* Animated grid background */}
      <div className={styles.grid} aria-hidden="true" />

      {/* Floating orbs */}
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}>🧭</div>
          <span>PathFinder</span>
        </div>
        <span className={styles.navBadge}>Powered by Coral</span>
      </nav>

      {/* Hero Content */}
      <div className={styles.content}>
        {/* Label */}
        <div className={styles.topBadge}>
          <span className={styles.dot} />
          AI Career Routing Agent — WeMakeDevs Hackathon 2026
        </div>

        {/* Headline */}
        <h1 className={styles.headline}>
          Stop Guessing.<br />
          <span className={styles.gradient}>Map Your Path.</span>
        </h1>

        <p className={styles.subheadline}>
          PathFinder reads your actual GitHub repos, cross-references real job listings,
          and generates a hyper-personalized skill roadmap — powered by a single Coral SQL join.
        </p>

        {/* Feature pills */}
        <div className={styles.featurePills}>
          {[
            { icon: '🔍', text: 'Reads your GitHub live' },
            { icon: '⚡', text: 'Coral cross-source SQL' },
            { icon: '🤖', text: 'Gemini gap analysis' },
            { icon: '📋', text: 'Pushes to Notion' },
          ].map(f => (
            <div key={f.text} className={styles.pill}>
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} id="analyze-form">
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="target-role">
              🎯 Target Role
            </label>
            <input
              id="target-role"
              className={styles.input}
              type="text"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer at Stripe"
              autoComplete="off"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="github-username">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub Username
            </label>
            <input
              id="github-username"
              className={styles.input}
              type="text"
              value={githubUsername}
              onChange={e => setGithubUsername(e.target.value)}
              placeholder="e.g. torvalds"
              autoComplete="off"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBanner} role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            id="analyze-btn"
            type="submit"
            className={styles.cta}
            disabled={loading || !targetRole.trim() || !githubUsername.trim()}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Initializing Coral...
              </>
            ) : (
              <>
                Find My Path
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Role suggestions */}
        <div className={styles.suggestions}>
          <span className={styles.suggestionsLabel}>Try:</span>
          {ROLE_SUGGESTIONS.slice(0, 4).map(role => (
            <button
              key={role}
              type="button"
              className={styles.suggestionChip}
              onClick={() => fillSuggestion(role)}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {[
            { value: '3', label: 'data sources joined' },
            { value: '1', label: 'Coral SQL query' },
            { value: '~15s', label: 'full analysis' },
          ].map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span>Scroll to explore</span>
      </div>
    </div>
  );
}
