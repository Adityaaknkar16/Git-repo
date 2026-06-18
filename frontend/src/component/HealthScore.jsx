import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Shield, CheckCircle, Clock, Users, Calendar, Copy, Check } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function HealthScore({ repoUrl }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [healthData, setHealthData] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    if (!repoUrl) return;
    
    const fetchHealthScore = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.post(`${BACKEND_URL}/api/health-score`, { repoUrl });
        setHealthData(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch health score');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthScore();
  }, [repoUrl]);

  if (loading) {
    return (
      <div className="health-loading">
        <div className="spinner"></div>
        <p>Calculating repository health score metrics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-card glass-panel">{error}</div>;
  }

  if (!healthData) {
    return <div className="info-card glass-panel">Please analyze a repository to check health metrics.</div>;
  }

  const { score, grade, breakdown, repoInfo } = healthData;

  // Determine color based on score
  const getColor = (s) => {
    if (s >= 80) return '#39d353'; // Green
    if (s >= 60) return '#ffb703'; // Amber
    return '#ff5555'; // Red
  };

  const scoreColor = getColor(score);
  
  // SVG circular ring calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Badge URL
  const badgeUrl = `${BACKEND_URL}/api/badge/${repoInfo.owner}/${repoInfo.repo}`;
  const markdownSnippet = `[![Repository Health](${badgeUrl})](${repoUrl})`;
  const htmlSnippet = `<a href="${repoUrl}"><img src="${badgeUrl}" alt="Repository Health" /></a>`;
  const iframeSnippet = `<iframe src="${badgeUrl}" width="150" height="30" frameborder="0" scrolling="no"></iframe>`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  return (
    <div className="health-container">
      <div className="health-grid">
        {/* Ring & Overall Score */}
        <div className="card score-card glass-panel">
          <h3>Overall Health Score</h3>
          <div className="circle-wrapper">
            <svg width="180" height="180" viewBox="0 0 180 180" className="animated-ring">
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="ring-bg"
                strokeWidth="12"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="ring-progress"
                strokeWidth="12"
                stroke={scoreColor}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
            </svg>
            <div className="score-display">
              <span className="score-num" style={{ color: scoreColor }}>{score}</span>
              <span className="score-grade" style={{ textShadow: `0 0 10px ${scoreColor}88` }}>Grade {grade}</span>
            </div>
          </div>
          <p className="score-desc">
            This grade represents the overall activity, responsiveness, and collaborative state of the codebase.
          </p>
        </div>

        {/* Metric Breakdown */}
        <div className="card breakdown-card glass-panel">
          <h3>Metric Breakdown</h3>
          <div className="breakdown-list">
            {Object.entries(breakdown).map(([key, item]) => {
              const itemColor = getColor(item.score);
              return (
                <div key={key} className="breakdown-row">
                  <div className="row-meta">
                    <span className="row-label">{item.label}</span>
                    <span className="row-score" style={{ color: itemColor }}>{item.score}/100</span>
                  </div>
                  <div className="bar-bg">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${item.score}%`, 
                        backgroundColor: itemColor,
                        boxShadow: `0 0 8px ${itemColor}aa` 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature 6: Get Your Badge */}
      <div className="card badge-card glass-panel">
        <h3>Get Your Embeddable Badge Widget</h3>
        <p className="badge-subtitle">Showcase your repository health directly on your README or documentation site.</p>
        
        <div className="badge-preview-section">
          <div className="preview-label">Live Preview:</div>
          <img src={badgeUrl} alt="Live Badge Preview" className="badge-img-preview" />
        </div>

        <div className="snippet-grid">
          <div className="snippet-box">
            <div className="snippet-header">
              <span>Markdown</span>
              <button onClick={() => copyToClipboard(markdownSnippet, 'md')} className="copy-btn">
                {copiedText === 'md' ? <Check size={14} className="copied" /> : <Copy size={14} />}
                {copiedText === 'md' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="snippet-code"><code>{markdownSnippet}</code></pre>
          </div>

          <div className="snippet-box">
            <div className="snippet-header">
              <span>HTML</span>
              <button onClick={() => copyToClipboard(htmlSnippet, 'html')} className="copy-btn">
                {copiedText === 'html' ? <Check size={14} className="copied" /> : <Copy size={14} />}
                {copiedText === 'html' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="snippet-code"><code>{htmlSnippet}</code></pre>
          </div>

          <div className="snippet-box full-width">
            <div className="snippet-header">
              <span>Iframe Widget</span>
              <button onClick={() => copyToClipboard(iframeSnippet, 'iframe')} className="copy-btn">
                {copiedText === 'iframe' ? <Check size={14} className="copied" /> : <Copy size={14} />}
                {copiedText === 'iframe' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="snippet-code"><code>{iframeSnippet}</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
}
