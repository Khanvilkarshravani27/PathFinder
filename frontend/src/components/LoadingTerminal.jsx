import { useState, useEffect, useRef } from 'react';
import styles from './LoadingTerminal.module.css';

const STEPS = [
  { delay: 0,    text: '> Initializing Coral runtime...', color: 'teal' },
  { delay: 800,  text: '> Authenticating GitHub integration...', color: 'muted' },
  { delay: 1600, text: (role) => `> Querying job_market.job_listings WHERE role ILIKE '${role}'...`, color: 'muted' },
  { delay: 2600, text: (user) => `> SELECT * FROM github.repositories WHERE owner = '${user}' LIMIT 30...`, color: 'muted' },
  { delay: 3800, text: '> Executing cross-source JOIN...', color: 'purple' },
  { delay: 4800, text: '> Fetching notion.pages...', color: 'muted' },
  { delay: 5600, text: '> Sending data to Gemini 1.5 Flash...', color: 'muted' },
  { delay: 6800, text: '> Running gap analysis...', color: 'amber' },
  { delay: 7800, text: '> Generating action plan...', color: 'amber' },
  { delay: 9000, text: '✓ Analysis complete. Rendering dashboard...', color: 'green' },
];

export default function LoadingTerminal({ targetRole, githubUsername }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentLine, setCurrentLine] = useState('');
  const [progress, setProgress] = useState(0);
  const endRef = useRef(null);

  useEffect(() => {
    const timers = [];

    STEPS.forEach((step, i) => {
      const timer = setTimeout(() => {
        const text = typeof step.text === 'function'
          ? step.text(i === 2 ? (targetRole || 'Backend Engineer') : (githubUsername || 'user'))
          : step.text;

        setVisibleLines(prev => [...prev, { text, color: step.color }]);
        setProgress(Math.round(((i + 1) / STEPS.length) * 100));
      }, step.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [targetRole, githubUsername]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLines]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.terminal}>
        {/* Terminal header */}
        <div className={styles.header}>
          <div className={styles.dots}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <span className={styles.title}>PathFinder — Coral Agent</span>
          <span className={styles.statusBadge}>LIVE</span>
        </div>

        {/* Terminal body */}
        <div className={styles.body}>
          {/* Query display */}
          <div className={styles.queryBlock}>
            <div className={styles.queryLabel}>CORAL SQL — CROSS-SOURCE JOIN</div>
            <pre className={styles.queryCode}>{`SELECT
  j.tech_stack   AS required_skills,
  g.language     AS my_stack,
  g.name         AS repo_name,
  n.title        AS current_tasks
FROM job_market.job_listings j
JOIN github.repositories g
  ON g.owner = '${githubUsername || 'user'}'
JOIN notion.pages n
  ON n.database_id = :dbId
WHERE j.role_name ILIKE '%${targetRole || 'Engineer'}%'
LIMIT 30;`}</pre>
          </div>

          <div className={styles.divider} />

          {/* Live log lines */}
          <div className={styles.log}>
            {visibleLines.map((line, i) => (
              <div
                key={i}
                className={`${styles.logLine} ${styles[`color_${line.color}`]}`}
              >
                {line.text}
              </div>
            ))}
            {visibleLines.length < STEPS.length && (
              <div className={styles.cursor}>▋</div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.footer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressLabel}>
            <span className={styles.progressText}>Analyzing...</span>
            <span className={styles.progressPct}>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className={styles.glow} aria-hidden="true" />
    </div>
  );
}
