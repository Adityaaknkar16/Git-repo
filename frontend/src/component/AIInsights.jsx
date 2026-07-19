/**
 * AIInsights Panel
 * Requests and displays advanced LLM-powered refactoring suggestions, security hotspots,
 * and general repository health overviews.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cpu, Terminal, RefreshCw, MessageSquare } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function AIInsights({ repoUrl, languages, contributors, commitHistory }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/ai-insights`, {
        repoUrl,
        languages,
        contributors,
        commitHistory
      });
      setInsights(res.data);
    } catch (err) {
      setError('Failed to load AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoUrl) {
      fetchInsights();
    }
  }, [repoUrl]);

  return (
    <div className="ai-insights-container">
      <div className="ai-header glass-panel">
        <div className="title-row">
          <Cpu size={20} className="ai-icon" />
          <div>
            <h4>AI Code Analyzer</h4>
            <p className="subtitle">Automated refactoring hotspots & repository summary.</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={fetchInsights} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading-state">
          <p>Analyzing repository codebase layout and history patterns...</p>
        </div>
      )}

      {insights && !loading && (
        <div className="insights-results">
          <div className="insight-block glass-panel">
            <h5>Summary Summary</h5>
            <p>{insights.summary}</p>
          </div>

          <div className="insight-block glass-panel">
            <h5>Suggested Refactoring Hotspots</h5>
            <div className="hotspot-suggestions">
              {insights.hotspots?.map((h, idx) => (
                <div key={idx} className="suggestion-item">
                  <div className="file-header">
                    <Terminal size={14} className="icon" />
                    <span className="file-path">{h.path}</span>
                    <span className={`badge ${h.score.toLowerCase().replace(' ', '-')}`}>{h.score}</span>
                  </div>
                  <p className="reason">{h.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="insight-block glass-panel">
            <h5>Refactoring Best Practices</h5>
            <ul className="tips-list">
              {insights.refactoringTips?.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <style>{`
        .ai-insights-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ai-header {
          padding: 12px 14px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ai-icon {
          color: #00e575;
          animation: pulse 2s infinite alternate;
        }
        .ai-header h4 { margin: 0; font-size: 13px; }
        .ai-header .subtitle { margin: 2px 0 0; font-size: 11px; color: var(--muted); }
        .refresh-btn {
          background: #23232b;
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
          cursor: pointer;
        }
        .refresh-btn:hover { background: #2e2e38; }
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .insights-results {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .insight-block {
          padding: 14px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .insight-block h5 {
          margin: 0 0 10px;
          font-size: 13px;
          color: #646cff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .insight-block p {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.6;
          color: var(--text);
        }
        .hotspot-suggestions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .suggestion-item {
          padding: 10px;
          background: #23232b;
          border: 1px solid var(--border);
          border-radius: 6px;
        }
        .suggestion-item .file-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        .suggestion-item .file-path {
          font-family: monospace;
          flex: 1;
        }
        .suggestion-item .badge {
          font-size: 9px;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .suggestion-item .badge.high-risk { background: rgba(255, 71, 71, 0.15); color: #ff4747; }
        .suggestion-item .badge.medium-risk { background: rgba(255, 170, 0, 0.15); color: #ffaa00; }
        .suggestion-item .badge.low-risk { background: rgba(0, 229, 117, 0.15); color: #00e575; }
        .suggestion-item .reason {
          font-size: 11.5px;
          color: var(--muted);
          margin: 0;
        }
        .tips-list {
          margin: 0;
          padding-left: 18px;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: var(--muted);
        }
        .loading-state {
          text-align: center;
          padding: 30px 0;
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
