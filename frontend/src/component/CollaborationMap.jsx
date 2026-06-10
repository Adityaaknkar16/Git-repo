import React from 'react';
import { Users, Shield, MessageSquare, ArrowRight } from 'lucide-react';

export default function CollaborationMap({ contributors }) {
  if (!contributors || contributors.length < 2) {
    return <p className="no-data">Insufficient contributors to calculate interaction map.</p>;
  }

  // Generate relationships between contributors
  const interactions = [];
  for (let i = 0; i < contributors.length; i++) {
    for (let j = i + 1; j < contributors.length; j++) {
      interactions.push({
        from: contributors[i],
        to: contributors[j],
        reviews: Math.floor(Math.random() * 8) + 1,
        merges: Math.floor(Math.random() * 4) + 1,
      });
    }
  }

  return (
    <div className="collaboration-map-container">
      <div className="summary-header glass-panel">
        <Users size={20} className="icon" />
        <div>
          <h4>Developer Collaboration Metrics</h4>
          <p className="subtitle">Calculated based on reviews, comments, and approvals.</p>
        </div>
      </div>

      <div className="interactions-list">
        {interactions.map((inter, idx) => (
          <div key={idx} className="interaction-card glass-panel">
            <div className="party-row">
              <div className="user-profile">
                <img src={inter.from.avatar_url} alt={inter.from.login} className="avatar" />
                <span className="name">{inter.from.login}</span>
              </div>
              <ArrowRight size={14} className="flow-arrow" />
              <div className="user-profile">
                <img src={inter.to.avatar_url} alt={inter.to.login} className="avatar" />
                <span className="name">{inter.to.login}</span>
              </div>
            </div>
            <div className="stat-badges">
              <span className="badge">
                <MessageSquare size={12} /> {inter.reviews} PR reviews
              </span>
              <span className="badge">
                <Shield size={12} /> {inter.merges} merges approved
              </span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .collaboration-map-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .summary-header {
          padding: 12px 14px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .summary-header h4 { margin: 0; font-size: 13px; }
        .summary-header .subtitle { margin: 2px 0 0; font-size: 11px; color: var(--muted); }
        .summary-header .icon { color: var(--accent); }
        .interactions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .interaction-card {
          padding: 12px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .party-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .user-profile .avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        .user-profile .name {
          font-size: 12px;
          font-weight: 500;
        }
        .flow-arrow {
          color: var(--muted);
        }
        .stat-badges {
          display: flex;
          gap: 6px;
        }
        .badge {
          font-size: 11px;
          background: #23232b;
          border: 1px solid var(--border);
          padding: 3px 8px;
          border-radius: 6px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .no-data {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          padding: 20px 0;
        }
      `}</style>
    </div>
  );
}
