import { useState } from 'react';
import SkillComparison from './SkillComparison';
import ActionPlanTimeline from './ActionPlanTimeline';
import AgentChat from './AgentChat';
import styles from './Dashboard.module.css';

export default function Dashboard({ data, onReset, apiUrl }) {
  const { analysis, meta, rawData } = data;
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className={styles.dashboard}>
      {/* Top bar */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🧭</span>
            <span className={styles.logoText}>PathFinder</span>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaBadge}>
              <span className={styles.metaDot} />
              Analysis Complete
            </span>
            <span className={styles.metaInfo}>
              {meta.githubReposScanned} repos · {meta.jobListingsAnalyzed} jobs · {meta.coralMode ? 'Coral CLI' : 'Direct API'}
            </span>
          </div>
        </div>
        <button className={styles.resetBtn} onClick={onReset} id="reset-btn">
          ← New Analysis
        </button>
      </header>

      {/* Summary card */}
      <div className={styles.summaryBanner}>
        <div className={styles.summaryIcon}>✨</div>
        <p className={styles.summaryText}>{analysis.summary}</p>
        <div className={styles.summaryStats}>
          <div className={styles.summaryStat}>
            <span className={styles.summaryStatValue} style={{ color: 'var(--accent-green)' }}>
              {analysis.matched_skills?.length || 0}
            </span>
            <span className={styles.summaryStatLabel}>matched</span>
          </div>
          <div className={styles.summaryStat}>
            <span className={styles.summaryStatValue} style={{ color: 'var(--accent-rose)' }}>
              {analysis.missing_skills?.length || 0}
            </span>
            <span className={styles.summaryStatLabel}>missing</span>
          </div>
          <div className={styles.summaryStat}>
            <span className={styles.summaryStatValue} style={{ color: 'var(--accent-amber)' }}>
              {analysis.timeline_estimate || 'TBD'}
            </span>
            <span className={styles.summaryStatLabel}>to job-ready</span>
          </div>
        </div>
      </div>

      {/* Quick wins */}
      {analysis.quick_wins?.length > 0 && (
        <div className={styles.quickWins}>
          <div className={styles.quickWinsLabel}>⚡ Quick wins — do these today</div>
          <div className={styles.quickWinsList}>
            {analysis.quick_wins.map((win, i) => (
              <div key={i} className={styles.quickWin}>
                <span className={styles.quickWinNum}>{i + 1}</span>
                {win}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { id: 'overview', label: '📊 Skill Gap', count: analysis.missing_skills?.length },
          { id: 'plan', label: '🗺️ Action Plan', count: analysis.action_plan?.length },
          { id: 'chat', label: '💬 Ask PathFinder' },
        ].map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <SkillComparison analysis={analysis} rawData={rawData} />
        )}
        {activeTab === 'plan' && (
          <ActionPlanTimeline
            steps={analysis.action_plan}
            apiUrl={apiUrl}
          />
        )}
        {activeTab === 'chat' && (
          <AgentChat analysis={analysis} apiUrl={apiUrl} />
        )}
      </div>
    </div>
  );
}
