import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, Package, ArrowUpRight } from 'lucide-react';

export default function DependencyGraph({ dependencies }) {
  const [filterVulnerable, setFilterVulnerable] = useState(false);

  const list = Object.keys(dependencies || {}).map(name => {
    const version = dependencies[name];
    // Simulate some vulnerability diagnostics
    let status = 'secure';
    let advisory = '';
    let current = version.replace(/[\^~]/, '');
    let latest = current;

    if (name.includes('axios') || name.includes('express')) {
      status = 'high';
      advisory = 'CVE-2026-9912: Server-Side Request Forgery vulnerability found.';
      latest = '1.7.2';
    } else if (name.includes('chart.js') || name.includes('d3')) {
      status = 'medium';
      advisory = 'Prototype pollution in configuration parsed layers.';
      latest = '4.5.3';
    }

    return {
      name,
      version,
      current,
      latest,
      status,
      advisory
    };
  });

  const filtered = filterVulnerable ? list.filter(item => item.status !== 'secure') : list;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'high':
        return <span className="vuln-badge high"><ShieldAlert size={12} /> High Vulnerability</span>;
      case 'medium':
        return <span className="vuln-badge medium"><ShieldAlert size={12} /> Medium Advisory</span>;
      default:
        return <span className="vuln-badge secure"><ShieldCheck size={12} /> Secure</span>;
    }
  };

  return (
    <div className="dependency-graph-container">
      <div className="toolbar glass-panel">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={filterVulnerable} 
            onChange={(e) => setFilterVulnerable(e.target.checked)} 
          />
          Show Vulnerabilities / Warnings Only
        </label>
      </div>

      <div className="dependency-tree">
        {filtered.map(dep => (
          <div key={dep.name} className={`dep-card glass-panel status-${dep.status}`}>
            <div className="dep-info">
              <div className="dep-title-row">
                <Package size={16} className="pkg-icon" />
                <span className="dep-name">{dep.name}</span>
                <span className="dep-version">{dep.version}</span>
              </div>
              {dep.status !== 'secure' && (
                <div className="advisory-text">{dep.advisory}</div>
              )}
            </div>
            <div className="dep-meta">
              {getStatusBadge(dep.status)}
              {dep.status !== 'secure' && (
                <div className="update-prompt">
                  <span>Latest: {dep.latest}</span>
                  <ArrowUpRight size={12} />
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="no-data">No matching dependencies found.</p>
        )}
      </div>

      <style>{`
        .dependency-graph-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .toolbar {
          padding: 10px 14px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          cursor: pointer;
          user-select: none;
        }
        .dependency-tree {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 420px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .dep-card {
          padding: 12px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .dep-card.status-high {
          border-left: 3px solid #ff4747;
          background: rgba(255, 71, 71, 0.03);
        }
        .dep-card.status-medium {
          border-left: 3px solid #ffaa00;
          background: rgba(255, 170, 0, 0.03);
        }
        .dep-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }
        .dep-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pkg-icon { color: var(--muted); }
        .dep-name {
          font-weight: 600;
          font-size: 13px;
        }
        .dep-version {
          font-family: monospace;
          font-size: 11px;
          color: var(--muted);
          background: #23232b;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .advisory-text {
          font-size: 11px;
          color: #ff9f1c;
          margin-top: 4px;
        }
        .dep-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }
        .vuln-badge {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }
        .vuln-badge.high { background: rgba(255, 71, 71, 0.15); color: #ff4747; }
        .vuln-badge.medium { background: rgba(255, 170, 0, 0.15); color: #ffaa00; }
        .vuln-badge.secure { background: rgba(57, 211, 83, 0.15); color: #39d353; }
        .update-prompt {
          font-size: 10px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 2px;
          background: #23232b;
          padding: 2px 6px;
          border-radius: 4px;
          cursor: pointer;
        }
        .update-prompt:hover {
          color: var(--text);
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
