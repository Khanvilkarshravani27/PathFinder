import styles from './SkillComparison.module.css';

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3776ab',
  Java: '#ed8b00', Go: '#00add8', Rust: '#ce412b', 'C++': '#00599c',
  Ruby: '#cc342d', Swift: '#fa7343', Kotlin: '#7f52ff',
  PHP: '#777bb4', 'C#': '#239120', HTML: '#e34f26', CSS: '#1572b6',
  Shell: '#89e051', Dart: '#00b4ab',
};

const getLangColor = (lang) => LANG_COLORS[lang] || 'var(--accent-teal)';

export default function SkillComparison({ analysis, rawData }) {
  const { matched_skills = [], missing_skills = [], user_current_stack = [] } = analysis;
  const repos = rawData?.github || [];

  return (
    <div className={styles.wrapper}>
      {/* Left: Skills comparison */}
      <div className={styles.skillsPanel}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnIcon}>✅</span>
            <div>
              <h3 className={styles.columnTitle}>Skills You Have</h3>
              <p className={styles.columnSub}>{matched_skills.length} matched</p>
            </div>
          </div>
          <div className={styles.skillGrid}>
            {matched_skills.map(skill => (
              <div key={skill} className={`${styles.skillTag} ${styles.matched}`}>
                <span className={styles.skillDot} style={{ background: 'var(--accent-green)' }} />
                {skill}
              </div>
            ))}
            {matched_skills.length === 0 && (
              <p className={styles.emptyNote}>No matches detected yet</p>
            )}
          </div>
        </div>

        <div className={styles.divider} aria-hidden="true">
          <div className={styles.dividerLine} />
          <span className={styles.dividerLabel}>vs</span>
          <div className={styles.dividerLine} />
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnIcon}>❌</span>
            <div>
              <h3 className={styles.columnTitle}>Skills to Learn</h3>
              <p className={styles.columnSub}>{missing_skills.length} missing</p>
            </div>
          </div>
          <div className={styles.skillGrid}>
            {missing_skills.map(skill => (
              <div key={skill} className={`${styles.skillTag} ${styles.missing}`}>
                <span className={styles.skillDot} style={{ background: 'var(--accent-rose)' }} />
                {skill}
              </div>
            ))}
            {missing_skills.length === 0 && (
              <p className={styles.emptyNote}>🎉 You have all required skills!</p>
            )}
          </div>
        </div>
      </div>

      {/* Right: GitHub repos */}
      <div className={styles.reposPanel}>
        <div className={styles.panelHeader}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.7">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span>Your GitHub Repositories</span>
          <span className={styles.repoCount}>{repos.length}</span>
        </div>

        <div className={styles.repoList}>
          {repos.slice(0, 12).map((repo, i) => (
            <a
              key={repo.repo_name}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.repoCard}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className={styles.repoTop}>
                <span className={styles.repoName}>{repo.repo_name}</span>
                <span className={styles.repoStars}>
                  {repo.stars > 0 && `★ ${repo.stars}`}
                </span>
              </div>
              <div className={styles.repoBottom}>
                {repo.primary_language && (
                  <span className={styles.repoLang}>
                    <span
                      className={styles.langDot}
                      style={{ background: getLangColor(repo.primary_language) }}
                    />
                    {repo.primary_language}
                  </span>
                )}
                <div className={styles.repoTopics}>
                  {repo.repo_topics?.slice(0, 2).map(t => (
                    <span key={t} className={styles.topicTag}>{t}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Stack breakdown */}
        {user_current_stack.length > 0 && (
          <div className={styles.stackBreakdown}>
            <div className={styles.panelHeader}>
              <span>📦 Detected Stack</span>
            </div>
            <div className={styles.stackTags}>
              {user_current_stack.map(tech => (
                <span key={tech} className={styles.stackTag}>
                  <span
                    className={styles.langDot}
                    style={{ background: getLangColor(tech) }}
                  />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
