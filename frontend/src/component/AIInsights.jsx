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
          gap: 16px;
        }
        .ai-header {
          padding: 14px 16px;
          background: #ffffff !important;
          border: 2px solid #000000 !important;
          box-shadow: 3px 3px 0px #000000 !important;
          border-radius: 0px !important;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #000000 !important;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ai-icon {
          color: #000000 !important;
        }
        .ai-header h4 { 
          margin: 0; 
          font-size: 14px; 
          color: #000000 !important; 
          font-family: 'Space Mono', monospace !important; 
          font-weight: 800 !important; 
        }
        .ai-header .subtitle { 
          margin: 3px 0 0; 
          font-size: 11px; 
          color: #52525b !important; 
          font-family: 'Space Mono', monospace !important; 
          font-weight: 600 !important; 
        }
        .refresh-btn {
          background: #ffffff !important;
          border: 2px solid #000000 !important;
          box-shadow: 2px 2px 0px #000000 !important;
          border-radius: 0px !important;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000 !important;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.1s ease, color 0.1s ease;
        }
        .refresh-btn:hover { 
          background: #000000 !important; 
          color: #ffffff !important; 
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px #000000 !important;
        }
        .refresh-btn:hover svg {
          stroke: #ffffff !important;
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .insights-results {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .insight-block {
          padding: 18px 20px;
          background: #ffffff !important;
          border: 2px solid #000000 !important;
          box-shadow: 4px 4px 0px #000000 !important;
          border-radius: 0px !important;
          color: #000000 !important;
        }
        .insight-block h5 {
          margin: 0 0 14px;
          font-size: 13px;
          color: #000000 !important;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: 'Space Mono', monospace !important;
          font-weight: 800 !important;
          border-bottom: 2px solid #000000 !important;
          padding-bottom: 8px;
        }
        .insight-block p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: #000000 !important;
          font-family: 'Space Mono', monospace !important;
          font-weight: 600 !important;
        }
        .hotspot-suggestions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .suggestion-item {
          padding: 14px 16px;
          background: #ffffff !important;
          border: 2px solid #000000 !important;
          box-shadow: 3px 3px 0px #000000 !important;
          border-radius: 0px !important;
          color: #000000 !important;
        }
        .suggestion-item .file-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 800;
          color: #000000 !important;
          font-family: 'Space Mono', monospace !important;
        }
        .suggestion-item .file-header .icon {
          color: #000000 !important;
          stroke: #000000 !important;
        }
        .suggestion-item .file-path {
          font-family: 'Space Mono', monospace !important;
          font-size: 13px;
          font-weight: 800;
          color: #000000 !important;
          flex: 1;
        }
        .suggestion-item .badge {
          font-family: 'Space Mono', monospace !important;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 0px !important;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .suggestion-item .badge.high-risk { 
          background: #000000 !important; 
          color: #ffffff !important; 
          border: 1.5px solid #000000 !important; 
        }
        .suggestion-item .badge.medium-risk { 
          background: #ffffff !important; 
          color: #000000 !important; 
          border: 1.5px solid #000000 !important; 
          box-shadow: 1.5px 1.5px 0px #000000 !important;
        }
        .suggestion-item .badge.low-risk { 
          background: #f4f4f5 !important; 
          color: #000000 !important; 
          border: 1.5px solid #000000 !important; 
        }
        .suggestion-item .reason {
          font-size: 12.5px;
          color: #18181b !important;
          font-family: 'Space Mono', monospace !important;
          font-weight: 600 !important;
          line-height: 1.6;
          margin: 0;
        }
        .tips-list {
          margin: 0;
          padding-left: 20px;
          font-size: 12.5px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #18181b !important;
          font-family: 'Space Mono', monospace !important;
          font-weight: 600 !important;
        }
        .tips-list li {
          line-height: 1.6;
        }
        .loading-state {
          text-align: center;
          padding: 30px 0;
          font-size: 12px;
          color: #000000 !important;
          font-family: 'Space Mono', monospace !important;
          font-weight: 700 !important;
        }
        .error {
          padding: 12px 14px;
          background: #ffffff !important;
          border: 2px solid #000000 !important;
          box-shadow: 2px 2px 0px #000000 !important;
          color: #000000 !important;
          font-family: 'Space Mono', monospace !important;
          font-size: 12px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
