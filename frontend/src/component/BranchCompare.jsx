import React, { useState } from 'react';
import axios from 'axios';
import { GitCompare, AlertTriangle, CheckCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function BranchCompare({ repoUrl, branches }) {
  const [base, setBase] = useState(branches[0] || 'main');
  const [head, setHead] = useState(branches[1] || 'dev');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/branch-compare`, {
        repoUrl,
        base,
        head
      });
      setResult(res.data);
    } catch (err) {
      setError('Failed to perform branch comparison.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="branch-compare-container">
      <div className="compare-selector glass-panel">
        <div className="select-row">
          <div className="select-group">
            <label>Base Branch</label>
            <select value={base} onChange={(e) => setBase(e.target.value)}>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="compare-divider">
            <GitCompare size={20} className="icon" />
          </div>
          <div className="select-group">
            <label>Compare Branch</label>
            <select value={head} onChange={(e) => setHead(e.target.value)}>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <button className="compare-btn" onClick={handleCompare} disabled={loading}>
          {loading ? 'Comparing...' : 'Compare Branches'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="compare-results">
          <div className="summary-cards">
            <div className="summary-card glass-panel">
              <h4>Ahead By</h4>
              <span className="count positive">{result.aheadBy} commits</span>
            </div>
            <div className="summary-card glass-panel">
              <h4>Behind By</h4>
              <span className="count negative">{result.behindBy} commits</span>
            </div>
          </div>

          {result.conflicts && result.conflicts.length > 0 ? (
            <div className="alert-box warning glass-panel">
              <AlertTriangle className="alert-icon" />
              <div>
                <h4>Potential Merge Conflicts Detected!</h4>
                <ul>
                  {result.conflicts.map((c, idx) => (
                    <li key={idx}><strong>{c.filename}</strong>: {c.reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="alert-box success glass-panel">
              <CheckCircle className="alert-icon" />
              <div>
                <h4>No Conflicts Detected</h4>
                <p>Branches can be merged automatically.</p>
              </div>
            </div>
          )}

          <div className="diff-viewer glass-panel">
            <h3>Files Changed ({result.files?.length || 0})</h3>
            <div className="file-diff-list">
              {result.files?.map((file, idx) => (
                <details className="file-diff-item" key={idx}>
                  <summary className="file-header">
                    <span className="filename">{file.filename}</span>
                    <div className="changes-indicator">
                      <span className="additions">+{file.additions}</span>
                      <span className="deletions">-{file.deletions}</span>
                    </div>
                  </summary>
                  {file.patch ? (
                    <pre className="patch-code">
                      <code>{file.patch}</code>
                    </pre>
                  ) : (
                    <p className="no-patch">Binary file change or empty patch.</p>
                  )}
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .branch-compare-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .compare-selector {
          padding: 16px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .select-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .select-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .select-group label {
          font-size: 12px;
          color: var(--muted);
        }
        .select-group select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: #23232b;
          color: var(--text);
        }
        .compare-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 18px;
          color: var(--accent);
        }
        .compare-btn {
          width: 100%;
          padding: 10px;
          background: var(--accent);
          border: none;
          color: white;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .summary-card {
          padding: 14px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          text-align: center;
        }
        .summary-card h4 {
          margin: 0 0 8px;
          font-size: 13px;
          color: var(--muted);
        }
        .summary-card .count {
          font-size: 18px;
          font-weight: 600;
        }
        .summary-card .count.positive { color: #39d353; }
        .summary-card .count.negative { color: #ff5555; }
        .alert-box {
          display: flex;
          gap: 12px;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .alert-box.warning {
          background: rgba(255, 120, 0, 0.08);
          border-color: rgba(255, 120, 0, 0.3);
        }
        .alert-box.warning h4 { color: #ff9f1c; margin: 0 0 6px; }
        .alert-box.warning ul { margin: 0; padding-left: 18px; font-size: 12px; color: var(--text); }
        .alert-box.success {
          background: rgba(0, 229, 117, 0.08);
          border-color: rgba(0, 229, 117, 0.3);
        }
        .alert-box.success h4 { color: #00e575; margin: 0 0 4px; }
        .alert-box.success p { margin: 0; font-size: 12px; color: var(--muted); }
        .alert-icon { flex-shrink: 0; margin-top: 2px; }
        .diff-viewer {
          padding: 16px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .diff-viewer h3 { margin: 0 0 12px; font-size: 14px; }
        .file-diff-list { display: flex; flex-direction: column; gap: 8px; }
        .file-diff-item {
          background: #23232b;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }
        .file-header {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
        }
        .filename { font-family: monospace; }
        .changes-indicator { font-size: 11px; display: flex; gap: 6px; }
        .changes-indicator .additions { color: #39d353; }
        .changes-indicator .deletions { color: #ff5555; }
        .patch-code {
          margin: 0;
          padding: 12px;
          background: #0f0f12;
          overflow-x: auto;
          font-family: monospace;
          font-size: 11px;
          border-top: 1px solid var(--border);
          color: #a0a0a0;
          white-space: pre-wrap;
        }
        .no-patch { padding: 12px; font-size: 12px; color: var(--muted); margin: 0; }
      `}</style>
    </div>
  );
}
