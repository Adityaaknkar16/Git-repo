import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Copy, Check, Download, Layers } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function GitignoreGenerator({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [gitignoreData, setGitignoreData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchGitignore = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/tools/gitignore/${owner}/${repo}`);
        setGitignoreData(res.data);
      } catch (err) {
        setError('Failed to generate gitignore template.');
      } finally {
        setLoading(false);
      }
    };

    fetchGitignore();
  }, [owner, repo]);

  const copyToClipboard = () => {
    if (!gitignoreData) return;
    navigator.clipboard.writeText(gitignoreData.gitignoreText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    if (!gitignoreData) return;
    const blob = new Blob([gitignoreData.gitignoreText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.gitignore';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Detecting tech stack and compiling gitignore rules...</p></div>;
  if (error) return <div className="error-card">{error}</div>;
  if (!gitignoreData) return null;

  const { gitignoreText, stacks } = gitignoreData;

  return (
    <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2>.gitignore Generator</h2>
        <p className="text-muted" style={{ marginTop: '4px' }}>Automatically compile ignore definitions based on detected technologies.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}>
          <Layers size={14} /> Detected Stack:
        </span>
        {stacks.map((stack) => (
          <span key={stack} className="badge" style={{ textTransform: 'uppercase', fontSize: '10px' }}>{stack}</span>
        ))}
      </div>

      <div className="snippet-box" style={{ flex: 1, minHeight: '300px' }}>
        <div className="snippet-header">
          <span>.gitignore Output</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={copyToClipboard} className="copy-btn">
              {copied ? <Check size={14} className="copied" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={downloadFile} className="copy-btn">
              <Download size={14} /> Download
            </button>
          </div>
        </div>
        <pre className="snippet-code" style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'left' }}>
          <code>{gitignoreText}</code>
        </pre>
      </div>
    </div>
  );
}
