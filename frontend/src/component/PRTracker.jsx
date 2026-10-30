/**
 * PRTracker Component
 * Traces pull request lifecycle milestones from draft creation to merge or decline status.
 */
import React from 'react';
import { GitPullRequest, CheckCircle2, GitMerge, XOctagon } from 'lucide-react';

export default function PRTracker({ prs = [] }) {
  const safePrs = Array.isArray(prs) ? prs : [];

  if (safePrs.length === 0) {
    return <p className="no-data">No Pull Requests found.</p>;
  }

  const getStatusIcon = (state) => {
    switch ((state || '').toLowerCase()) {
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
        {safePrs.map(pr => (
          <div className="pr-card glass-panel" key={pr.id || Math.random()}>
            <div className="pr-header">
              <div className="title-section">
                {getStatusIcon(pr.state)}
                <span className="pr-title">
                  {pr.title || 'Untitled Pull Request'} <strong className="id-tag">#{pr.id || ''}</strong>
                </span>
              </div>
              <span className={`status-badge ${pr.state || 'open'}`}>
                {pr.state || 'open'}
              </span>
            </div>
            <div className="pr-details">
              <div className="branches-flow">
                <span className="branch-name">{pr.branch || 'feature'}</span>
                <span className="arrow">→</span>
                <span className="branch-name base">{pr.baseBranch || 'main'}</span>
              </div>
              <div className="author-info">
                <img src={pr.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt={pr.user || 'User'} className="user-avatar" />
                <span>Opened by <strong>{pr.user || 'Developer'}</strong></span>
              </div>
            </div>
            <div className="linked-commits">
              <span className="label">Linked Commit:</span>
              {(pr.linkedCommits || []).map(sha => (
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
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          color: #000000;
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
          font-weight: 700;
          font-size: 14px;
          color: #000000;
        }
        .id-tag {
          color: #555555;
          margin-left: 4px;
        }
        .state-icon {
          flex-shrink: 0;
          color: #000000;
        }
        .status-badge {
          font-size: 11px;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 2px;
          font-weight: 800;
          border: 2px solid #000000;
          background: #ffffff;
          color: #000000;
        }
        .status-badge.merged { background: #000000; color: #ffffff; }
        .status-badge.closed { background: #555555; color: #ffffff; }
        .status-badge.open { background: #ffffff; color: #000000; }
        .pr-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #333333;
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
          background: #f0f0f0;
          border: 1px solid #000000;
          padding: 2px 6px;
          border-radius: 2px;
          color: #000000;
          font-weight: 700;
        }
        .branch-name.base {
          background: #000000;
          color: #ffffff;
        }
        .arrow { color: #000000; font-weight: 800; }
        .author-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: #000000;
        }
        .user-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid #000000;
        }
        .linked-commits {
          border-top: 1px solid #000000;
          padding-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        .linked-commits .label {
          color: #000000;
          font-weight: 700;
        }
        .commit-sha {
          font-family: monospace;
          background: #000000;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 2px;
          font-weight: 700;
        }
        .no-data {
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          text-align: center;
          padding: 20px 0;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
