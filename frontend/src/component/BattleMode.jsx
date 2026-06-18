import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Trophy, Share2, Copy, Check } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function BattleMode() {
  const [repoA, setRepoA] = useState('');
  const [repoB, setRepoB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Trigger battle from URL params on load if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRepoA = params.get('repoA');
    const urlRepoB = params.get('repoB');
    if (urlRepoA && urlRepoB) {
      setRepoA(urlRepoA);
      setRepoB(urlRepoB);
      runBattle(urlRepoA, urlRepoB);
    }
  }, []);

  const runBattle = async (a = repoA, b = repoB) => {
    if (!a || !b) {
      setError('Please provide both repository URLs.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/battle`, { repoA: a, repoB: b });
      setResult(res.data);
      
      // Update URL search params for shareable links
      const newUrl = `${window.location.origin}${window.location.pathname}?tab=battle&repoA=${encodeURIComponent(a)}&repoB=${encodeURIComponent(b)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);

      // Trigger Confetti
      triggerConfetti();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to complete battle comparison.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runBattle();
  };

  const triggerConfetti = () => {
    const colors = ['#5856d6', '#c644fc', '#39d353', '#ffb703', '#ff5555'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    for (let i = 0; i < 100; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 4;
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `-20px`;
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      const duration = Math.random() * 2 + 1.5;
      particle.style.transition = `transform ${duration}s linear, top ${duration}s linear, opacity ${duration}s ease-out`;

      container.appendChild(particle);

      // Trigger animation frame
      setTimeout(() => {
        particle.style.top = '105vh';
        particle.style.transform = `translate(${Math.random() * 200 - 100}px, 105vh) rotate(${Math.random() * 720}deg)`;
        particle.style.opacity = '0';
      }, 50);
    }

    setTimeout(() => {
      container.remove();
    }, 4000);
  };

  const getShareableUrl = () => {
    return `${window.location.origin}${window.location.pathname}?tab=battle&repoA=${encodeURIComponent(repoA)}&repoB=${encodeURIComponent(repoB)}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getShareableUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="battle-container">
      <div className="card glass-panel text-center">
        <h2>⚔️ Repo Battle Mode ⚔️</h2>
        <p className="text-muted">Enter two public repositories to compare their stats head-to-head.</p>
        
        <form onSubmit={handleSubmit} className="battle-setup">
          <div className="battle-inputs">
            <input 
              type="text" 
              placeholder="e.g. facebook/react" 
              value={repoA} 
              onChange={(e) => setRepoA(e.target.value)}
              required
            />
            <div className="vs-divider">VS</div>
            <input 
              type="text" 
              placeholder="e.g. vuejs/core" 
              value={repoB} 
              onChange={(e) => setRepoB(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="battle-btn-large" disabled={loading}>
            {loading ? 'Comparing stats...' : 'LAUNCH BATTLE'}
          </button>
        </form>

        {error && <div className="error" style={{ marginTop: '12px' }}>{error}</div>}
      </div>

      {result && (
        <div className="battle-layout">
          {/* Winner announcement header */}
          <div className="card glass-panel text-center">
            <h3>
              {result.winner === 'Tie' ? (
                "It's a Tie! 🤝"
              ) : (
                <>
                  🏆 Winner: <span style={{ color: '#39d353' }}>{result.winner === 'A' ? result.repoA.name : result.repoB.name}</span>!
                </>
              )}
            </h3>
            <p className="text-muted">
              Score: {result.scores.A} wins vs {result.scores.B} wins
            </p>
            
            <div className="battle-share">
              <button onClick={copyLink} className="copy-btn">
                {copied ? <Check size={14} className="copied" /> : <Share2 size={14} />}
                {copied ? 'Copied Link!' : 'Share Battle Result'}
              </button>
            </div>
          </div>

          {/* Split Screen Cards */}
          <div className="battle-grid-vs">
            <div className={`battle-side glass-panel ${result.winner === 'A' ? 'winner' : ''}`}>
              <div className="side-title">{result.repoA.name}</div>
              {result.winner === 'A' && <span className="winner-tag">OVERALL WINNER</span>}
              <div className="score-num" style={{ marginTop: '16px', fontSize: '32px', color: result.winner === 'A' ? '#39d353' : 'white' }}>
                {result.scores.A} pts
              </div>
            </div>

            <div className="vs-center">
              <div className="vs-circle">VS</div>
            </div>

            <div className={`battle-side glass-panel ${result.winner === 'B' ? 'winner' : ''}`}>
              <div className="side-title">{result.repoB.name}</div>
              {result.winner === 'B' && <span className="winner-tag">OVERALL WINNER</span>}
              <div className="score-num" style={{ marginTop: '16px', fontSize: '32px', color: result.winner === 'B' ? '#39d353' : 'white' }}>
                {result.scores.B} pts
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="comparison-table glass-panel">
            {/* Stars */}
            <div className={`comparison-row ${result.categoryWinners.stars ? 'win-a' : 'win-b'}`}>
              <div className={`comp-val ${result.categoryWinners.stars ? 'win' : ''}`}>{result.repoA.stars.toLocaleString()}</div>
              <div className="comp-label">⭐ Stars</div>
              <div className={`comp-val ${!result.categoryWinners.stars ? 'win' : ''}`}>{result.repoB.stars.toLocaleString()}</div>
            </div>

            {/* Forks */}
            <div className={`comparison-row ${result.categoryWinners.forks ? 'win-a' : 'win-b'}`}>
              <div className={`comp-val ${result.categoryWinners.forks ? 'win' : ''}`}>{result.repoA.forks.toLocaleString()}</div>
              <div className="comp-label">🍴 Forks</div>
              <div className={`comp-val ${!result.categoryWinners.forks ? 'win' : ''}`}>{result.repoB.forks.toLocaleString()}</div>
            </div>

            {/* Issues */}
            <div className={`comparison-row ${result.categoryWinners.issues ? 'win-a' : 'win-b'}`}>
              <div className={`comp-val ${result.categoryWinners.issues ? 'win' : ''}`}>{result.repoA.issues}</div>
              <div className="comp-label">⚠️ Open Issues (Lower is better)</div>
              <div className={`comp-val ${!result.categoryWinners.issues ? 'win' : ''}`}>{result.repoB.issues}</div>
            </div>

            {/* Commit Velocity */}
            <div className={`comparison-row ${result.categoryWinners.commits30Days ? 'win-a' : 'win-b'}`}>
              <div className={`comp-val ${result.categoryWinners.commits30Days ? 'win' : ''}`}>{result.repoA.commits30Days}</div>
              <div className="comp-label">⚡ Commits (30d)</div>
              <div className={`comp-val ${!result.categoryWinners.commits30Days ? 'win' : ''}`}>{result.repoB.commits30Days}</div>
            </div>

            {/* Contributors */}
            <div className={`comparison-row ${result.categoryWinners.contributors ? 'win-a' : 'win-b'}`}>
              <div className={`comp-val ${result.categoryWinners.contributors ? 'win' : ''}`}>{result.repoA.contributors}</div>
              <div className="comp-label">👥 Contributors</div>
              <div className={`comp-val ${!result.categoryWinners.contributors ? 'win' : ''}`}>{result.repoB.contributors}</div>
            </div>

            {/* PR Merge Speed */}
            <div className={`comparison-row ${result.categoryWinners.prSpeedDays ? 'win-a' : 'win-b'}`}>
              <div className={`comp-val ${result.categoryWinners.prSpeedDays ? 'win' : ''}`}>{result.repoA.prSpeedDays} days</div>
              <div className="comp-label">⏱️ Avg PR Merge Time (Lower is better)</div>
              <div className={`comp-val ${!result.categoryWinners.prSpeedDays ? 'win' : ''}`}>{result.repoB.prSpeedDays} days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
