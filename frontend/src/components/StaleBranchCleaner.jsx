import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Download, Copy, Check, Terminal, Square, CheckSquare } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function StaleBranchCleaner({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [staleBranches, setStaleBranches] = useState([]);
  const [days, setDays] = useState(30);
  const [selectedBranches, setSelectedBranches] = useState({});
  const [scriptText, setScriptText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchStaleBranches = async () => {
    setLoading(true);
    setError('');
    setScriptText('');
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tools/stale-branches/${owner}/${repo}?days=${days}`);
      setStaleBranches(res.data.staleBranches);
      // Select all by default
      const initialSelection = {};
      res.data.staleBranches.forEach(b => {
        initialSelection[b.name] = true;
      });
      setSelectedBranches(initialSelection);
    } catch (err) {
      setError('Failed to fetch stale branches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (owner && repo) {
      fetchStaleBranches();
    }
  }, [owner, repo]);

  const toggleSelect = (name) => {
    setSelectedBranches(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleGenerateScript = () => {
    const selected = Object.keys(selectedBranches).filter(name => selectedBranches[name]);
    if (selected.length === 0) {
      setScriptText('# No branches selected.');
      return;
    }

    let script = `#!/bin/bash\n# Stale Branch Cleanup Script for ${owner}/${repo}\n`;
    script += `# WARNING: Review before executing. This deletes remote branches.\n\n`;
    selected.forEach(branchName => {
      script += `git push origin --delete ${branchName}\n`;
    });

    setScriptText(script);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([scriptText], { type: 'application/x-sh;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cleanup_branches.sh';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Searching for stale branches...</p></div>;
  if (error) return <div className="error-card">{error}</div>;

  return (
    <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2>Stale Branch Cleaner Script Generator</h2>
        <p className="text-muted" style={{ marginTop: '4px' }}>
          Identify branches with no commits in the last N days, select target branches, and generate an automated cleanup script.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '10px 0' }}>
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Inactivity threshold (days):</span>
        <input 
          type="number" 
          value={days} 
          onChange={(e) => setDays(parseInt(e.target.value) || 30)}
          style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
        />
        <button className="copy-btn" onClick={fetchStaleBranches}>Refresh</button>
      </div>

      {/* Warning Banner */}
      <div className="bus-factor-banner" style={{ background: 'rgba(255, 183, 3, 0.08)', border: '1px solid #ffb703' }}>
        <AlertTriangle size={24} style={{ color: '#ffb703', flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: 'var(--text)' }}>
          <strong style={{ color: '#ffb703' }}>Warning:</strong> Remote branch deletion is permanent. Always review the target branches carefully before executing the generated script on your local environment.
        </div>
      </div>

      {staleBranches.length === 0 ? (
        <p className="text-muted text-center" style={{ padding: '20px' }}>🎉 Great! No stale branches found matching this threshold.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stale branches table list */}
          <div className="risky-files-list">
            {staleBranches.map((branch) => (
              <div 
                key={branch.name} 
                className="risky-file-item" 
                onClick={() => toggleSelect(branch.name)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: selectedBranches[branch.name] ? 'var(--accent)' : 'var(--muted)' }}>
                    {selectedBranches[branch.name] ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <strong style={{ color: 'white', fontFamily: 'monospace' }}>{branch.name}</strong>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', gap: '16px' }}>
                  <span>Last commit: {branch.author}</span>
                  <span style={{ color: '#ffb703' }}>{branch.daysSinceActivity} days inactive</span>
                </div>
              </div>
            ))}
          </div>

          <button className="battle-btn-large" onClick={handleGenerateScript} style={{ alignSelf: 'flex-start' }}>
            Generate Cleanup Script
          </button>
        </div>
      )}

      {scriptText && (
        <div className="snippet-box" style={{ marginTop: '20px' }}>
          <div className="snippet-header">
            <span>Generated Shell Script (.sh)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copyScript} className="copy-btn">
                {copied ? <Check size={14} className="copied" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={downloadScript} className="copy-btn">
                <Download size={14} /> Download Script
              </button>
            </div>
          </div>
          <pre className="snippet-code" style={{ textAlign: 'left' }}>
            <code>{scriptText}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
