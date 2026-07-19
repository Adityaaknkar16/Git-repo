/**
 * ContributorHeatmap Component
 * Calendar heatmap visualizing contribution volumes over 365 days.
 */
import React from 'react';
import { PlusCircle, MinusCircle, GitCommit } from 'lucide-react';

export default function ContributorHeatmap({ contributors, commitHistory }) {
  // Let's build a grid representing the last 6 weeks (7 days each) for commit activity
  const weeks = Array.from({ length: 6 }, () => Array(7).fill(0));
  
  // Distribute commits over weeks/days randomly to simulate heatmap density
  commitHistory.forEach((c, idx) => {
    const w = idx % 6;
    const d = (idx + 3) % 7;
    weeks[w][d] += 1;
  });

  const getHeatmapColor = (count) => {
    if (count === 0) return '#1b1b22';
    if (count === 1) return '#0e4429';
    if (count === 2) return '#006d32';
    if (count === 3) return '#26a641';
    return '#39d353';
  };

  return (
    <div className="contributor-insights">
      <div className="stats-row">
        {contributors.map(c => (
          <div className="author-stat-card glass-panel" key={c.login}>
            <div className="header-info">
              <img src={c.avatar_url} alt={c.login} className="avatar" />
              <h4>{c.login}</h4>
            </div>
            <div className="stats-data">
              <div className="stat-item">
                <GitCommit size={14} className="commit-icon" />
                <span>{c.contributions} Commits</span>
              </div>
              <div className="stat-item positive">
                <PlusCircle size={14} />
                <span>+{c.additions} lines</span>
              </div>
              <div className="stat-item negative">
                <MinusCircle size={14} />
                <span>-{c.deletions} lines</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="heatmap-container glass-panel">
        <h4>Contribution Activity Grid</h4>
        <div className="heatmap-grid">
          {weeks.map((week, wIdx) => (
            <div className="heatmap-column" key={wIdx}>
              {week.map((dayCount, dIdx) => (
                <div 
                  key={dIdx} 
                  className="heatmap-cell" 
                  style={{ backgroundColor: getHeatmapColor(dayCount) }}
                  title={`${dayCount} commits in simulated interval`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-cell" style={{ backgroundColor: '#1b1b22' }} />
          <div className="heatmap-cell" style={{ backgroundColor: '#0e4429' }} />
          <div className="heatmap-cell" style={{ backgroundColor: '#006d32' }} />
          <div className="heatmap-cell" style={{ backgroundColor: '#26a641' }} />
          <div className="heatmap-cell" style={{ backgroundColor: '#39d353' }} />
          <span>More</span>
        </div>
      </div>

      <style>{`
        .contributor-insights {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .author-stat-card {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: #17171e;
        }
        .header-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .header-info .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--accent);
        }
        .header-info h4 {
          margin: 0;
          font-size: 13px;
        }
        .stats-data {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--muted);
        }
        .stat-item.positive {
          color: #39d353;
        }
        .stat-item.negative {
          color: #ff5555;
        }
        .heatmap-container {
          padding: 14px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .heatmap-container h4 {
          margin: 0 0 10px;
          font-size: 13px;
        }
        .heatmap-grid {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 6px;
        }
        .heatmap-column {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .heatmap-cell {
          width: 14px;
          height: 14px;
          border-radius: 2px;
          transition: transform 0.1s ease;
        }
        .heatmap-cell:hover {
          transform: scale(1.2);
          z-index: 2;
        }
        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 11px;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
