import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, Package, ArrowUpRight } from 'lucide-react';

export default function DependencyGraph({ dependencies }) {
  const [filterVulnerable, setFilterVulnerable] = useState(false);

  const list = Object.keys(dependencies || {}).map(name => {
    const versionStr = String(version || '');
    // Simulate some vulnerability diagnostics
    let status = 'secure';
    let advisory = '';
    let current = versionStr.replace(/[\^~]/, '');
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
      version: versionStr,
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
      <div className="toolbar">
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
          <div key={dep.name} className={`dep-card status-${dep.status}`}>
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
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          user-select: none;
          color: #000000;
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
          padding: 12px 14px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 3px 3px 0px #000000;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .dep-card.status-high {
          border-left: 6px solid #000000;
          background: #fafafa;
        }
        .dep-card.status-medium {
          border-left: 6px solid #444444;
          background: #fafafa;
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
        .pkg-icon { color: #000000; }
        .dep-name {
          font-weight: 800;
          font-size: 14px;
          color: #000000;
        }
        .dep-version {
          font-family: monospace;
          font-size: 12px;
          color: #000000;
          background: #f0f0f0;
          border: 1px solid #000000;
          padding: 1px 6px;
          border-radius: 2px;
          font-weight: 600;
        }
        .advisory-text {
          font-size: 12px;
          color: #000000;
          font-weight: 600;
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
          font-size: 11px;
          padding: 3px 8px;
          border: 2px solid #000000;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .vuln-badge.high { background: #000000; color: #ffffff; }
        .vuln-badge.medium { background: #555555; color: #ffffff; }
        .vuln-badge.secure { background: #ffffff; color: #000000; }
        .update-prompt {
          font-size: 11px;
          font-weight: 700;
          font-family: monospace;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 3px;
          background: #f0f0f0;
          border: 1px solid #000000;
          padding: 2px 6px;
          border-radius: 2px;
        }
        .no-data {
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          text-align: center;
          padding: 20px 0;
        }
      `}</style>
    </div>
  );
}
