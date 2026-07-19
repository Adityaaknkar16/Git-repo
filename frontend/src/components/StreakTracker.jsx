/**
 * StreakTracker Component
 * Monitors consecutive active days of commits to drive developer motivation
 * through clean gamified visual streak badges.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Zap, Trophy, Flame } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function StreakTracker({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [streaks, setStreaks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchStreaks = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/gamification/streaks/${owner}/${repo}`);
        setStreaks(res.data.contributors);
      } catch (err) {
        setError('Failed to fetch developer streaks.');
      } finally {
        setLoading(false);
      }
    };

    fetchStreaks();
  }, [owner, repo]);

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Calculating commit streaks and consecutive contribution cycles...</p></div>;
  if (error) return <div className="error-card">{error}</div>;

  // Render a simple 28-day contribution map
  const renderContributionMap = (commitDates) => {
    const cells = [];
    const base = new Date();
    // 28 days back
    for (let i = 27; i >= 0; i--) {
      const d = new Date(base.getTime() - i * 24 * 60 * 60 * 1000);
      const formatted = d.toISOString().split('T')[0];
      const hasCommit = commitDates.includes(formatted);

      cells.push(
        <div 
          key={i} 
          style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '2px', 
            backgroundColor: hasCommit ? '#39d353' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.02)'
          }}
          title={`${formatted}: ${hasCommit ? 'Committed!' : 'No commits'}`}
        />
      );
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '3px', marginTop: '6px' }}>
        {cells}
      </div>
    );
  };

  return (
    <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2>🔥 Commit Streak Leaderboard</h2>
        <p className="text-muted" style={{ marginTop: '4px' }}>Ranks contributors by consecutive days of code updates.</p>
      </div>

      <div className="personas-grid" style={{ marginTop: '10px' }}>
        {streaks.map((s, idx) => (
          <div key={idx} className="persona-card glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '220px' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={s.avatar} 
                alt={`${s.login}'s avatar`} 
                className="persona-avatar"
                style={{ width: '64px', height: '64px', borderRadius: '50%' }}
              />
              <span style={{ 
                position: 'absolute', 
                bottom: '8px', 
                right: '-4px', 
                background: 'var(--gradient)', 
                color: 'white', 
                fontSize: '10px', 
                fontWeight: '800', 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                #{idx + 1}
              </span>
            </div>
            
            <div className="persona-name" style={{ marginTop: '10px' }}>{s.login}</div>
            
            <span className="persona-badge" style={{ 
              backgroundColor: 'rgba(255, 183, 3, 0.15)', 
              color: '#ffb703', 
              border: '1px solid rgba(255, 183, 3, 0.3)',
              fontSize: '11px',
              padding: '2px 8px',
              marginTop: '6px',
              animation: 'spin 1s ease-out'
            }}>
              {s.badge}
            </span>

            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="text-muted" style={{ fontSize: '11px' }}>Current</span>
                <strong style={{ color: '#ffb703', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Flame size={14} fill="#ffb703" /> {s.currentStreak}d
                </strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="text-muted" style={{ fontSize: '11px' }}>Longest</span>
                <strong style={{ color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Trophy size={14} color="#ffb703" /> {s.longestStreak}d
                </strong>
              </div>
            </div>

            {/* Streak Grid */}
            <div style={{ marginTop: '16px' }}>
              <span className="text-muted" style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Recent Activity Map</span>
              {renderContributionMap(s.commitDates)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
