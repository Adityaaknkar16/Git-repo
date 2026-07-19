/**
 * PRTracker Component
 * Traces pull request lifecycle milestones from draft creation to merge or decline status.
 */
import React from 'react';
import { GitPullRequest, CheckCircle2, GitMerge, XOctagon } from 'lucide-react';

export default function PRTracker({ prs }) {
  if (!prs || prs.length === 0) {
    return <p className="no-data">No Pull Requests found.</p>;
  }

  const getStatusIcon = (state) => {
    switch (state.toLowerCase()) {
      case 'merged':
        return <GitMerge size={16} className="state-icon merged" />;
      case 'closed':
        return <XOctagon size={16} className="state-icon closed" />;
      default:
        return <GitPullRequest size={16} className="state-icon open" />;
    }
  };

  return (
    <div className="pr-tracker-container">
      <div className="pr-list">
        {prs.map(pr => (
          <div className="pr-card glass-panel" key={pr.id}>
            <div className="pr-header">
              <div className="title-section">
                {getStatusIcon(pr.state)}
                <span className="pr-title">
                  {pr.title} <strong className="id-tag">#{pr.id}</strong>
                </span>
              </div>
              <span className={`status-badge ${pr.state}`}>
                {pr.state}
              </span>
            </div>
            <div className="pr-details">
              <div className="branches-flow">
                <span className="branch-name">{pr.branch}</span>
                <span className="arrow">→</span>
                <span className="branch-name base">{pr.baseBranch}</span>
              </div>
              <div className="author-info">
                <img src={pr.avatarUrl} alt={pr.user} className="user-avatar" />
                <span>Opened by <strong>{pr.user}</strong></span>
              </div>
            </div>
            <div className="linked-commits">
              <span className="label">Linked Commit:</span>
              {pr.linkedCommits.map(sha => (
                <span key={sha} className="commit-sha">{sha}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .pr-tracker-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pr-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pr-card {
          padding: 14px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pr-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .title-section {
          display: flex;
          gap: 8px;
          align-items: center;
          font-weight: 500;
          font-size: 13px;
        }
        .id-tag {
          color: var(--muted);
          margin-left: 4px;
        }
        .state-icon {
          flex-shrink: 0;
        }
        .state-icon.open { color: #39d353; }
        .state-icon.merged { color: #a371f7; }
        .state-icon.closed { color: #ff5555; }
        .status-badge {
          font-size: 10px;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .status-badge.open { background: rgba(57, 211, 83, 0.15); color: #39d353; }
        .status-badge.merged { background: rgba(163, 113, 247, 0.15); color: #a371f7; }
        .status-badge.closed { background: rgba(255, 85, 85, 0.15); color: #ff5555; }
        .pr-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--muted);
          flex-wrap: wrap;
          gap: 8px;
        }
        .branches-flow {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .branch-name {
          font-family: monospace;
          background: #23232b;
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text);
        }
        .branch-name.base {
          background: #1e1e24;
        }
        .arrow { color: var(--muted); }
        .author-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .user-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }
        .linked-commits {
          border-top: 1px solid var(--border);
          padding-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }
        .linked-commits .label {
          color: var(--muted);
        }
        .commit-sha {
          font-family: monospace;
          background: #111;
          color: var(--accent);
          padding: 1px 4px;
          border-radius: 4px;
        }
        .no-data {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          padding: 20px 0;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
