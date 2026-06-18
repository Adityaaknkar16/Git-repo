import React, { useState } from 'react';
import axios from 'axios';
import { Mic, RefreshCw, Share2, Check } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function RoastMyRepo({ owner, repo, stats }) {
  const [loading, setLoading] = useState(false);
  const [roastText, setRoastText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const getRoast = async () => {
    setLoading(true);
    setError('');
    setRoastText('');

    // Prepare repo metrics from props
    const commitFrequency = stats?.commitFrequency || Math.floor(Math.random() * 20) + 5;
    const openIssuesCount = stats?.openIssuesCount || Math.floor(Math.random() * 15) + 5;
    const prAgeDays = stats?.prAgeDays || Math.floor(Math.random() * 10) + 2;
    const busFactor = stats?.busFactor || 2;
    const lastCommitDate = stats?.lastCommitDate || new Date().toISOString();

    try {
      const res = await axios.post(`${BACKEND_URL}/api/gamification/roast/${owner}/${repo}`, {
        commitFrequency,
        openIssuesCount,
        prAgeDays,
        busFactor,
        lastCommitDate
      });
      
      // Implement typewriter effect
      const roast = res.data.roast;
      let i = 0;
      const timer = setInterval(() => {
        if (i < roast.length) {
          setRoastText(prev => prev + roast.charAt(i));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 15);
      
    } catch (err) {
      setError('Failed to generate repo roast. Comedian fell off the stage!');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const tweetText = `Just roasted our repository "${owner}/${repo}"! Roast snippet: "${roastText.substring(0, 150)}..." Roast yours on Git Repo Analyzer! 🎤 #RoastMyRepo`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card glass-panel text-center" style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(20, 10, 10, 0.75)', border: '1px solid rgba(255, 85, 85, 0.3)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Mic size={36} color="#ff5555" className="empty-icon" style={{ animationDuration: loading ? '1s' : '3s' }} />
        <h2>Roast My Repo Mode</h2>
        <p className="text-muted" style={{ margin: 0, fontSize: '13px' }}>
          Brutally funny but friendly feedback powered by AI tech comedians.
        </p>
      </div>

      {!roastText && !loading && (
        <button className="generate-guide-btn" onClick={getRoast} style={{ background: 'linear-gradient(135deg, #ff5555, #ff7733)', marginTop: '24px' }}>
          START ROAST
        </button>
      )}

      {loading && !roastText && (
        <div className="health-loading" style={{ marginTop: '20px' }}>
          <div className="spinner" style={{ borderTopColor: '#ff5555' }}></div>
          <p style={{ color: '#ff5555' }}>Tuning the guitar, getting ready to roast...</p>
        </div>
      )}

      {roastText && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div 
            className="guide-content-box" 
            style={{ 
              background: 'rgba(0,0,0,0.4)', 
              borderColor: 'rgba(255, 85, 85, 0.2)', 
              textAlign: 'left', 
              fontFamily: 'Outfit, sans-serif',
              whiteSpace: 'pre-line',
              color: '#f3f3f6'
            }}
          >
            {roastText}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="copy-btn" onClick={getRoast} disabled={loading} style={{ borderColor: 'rgba(255,85,85,0.3)' }}>
              <RefreshCw size={14} /> Roast Again
            </button>
            <button className="copy-btn" onClick={handleShare} style={{ borderColor: '#1da1f2', color: '#1da1f2' }}>
              <Share2 size={14} /> Share Roast
            </button>
          </div>
        </div>
      )}

      {error && <div className="error" style={{ marginTop: '12px' }}>{error}</div>}
    </div>
  );
}
