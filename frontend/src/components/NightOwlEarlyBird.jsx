/**
 * NightOwlEarlyBird Component
 * Visualizes commit frequencies by hour of the day to identify active coding hours.
 * Classifies team members into timezone-adjusted productivity profiles.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Clock, Moon, Sun, Monitor } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function NightOwlEarlyBird({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [activityData, setActivityData] = useState(null);
  const [error, setError] = useState('');
  const [activeContributor, setActiveContributor] = useState('');

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchActivity = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/analytics/activity-patterns/${owner}/${repo}`);
        setActivityData(res.data);
        if (res.data.contributors.length > 0) {
          setActiveContributor(res.data.contributors[0].login);
        }
      } catch (err) {
        setError('Failed to fetch activity pattern statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [owner, repo]);

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Aggregating developer hourly contribution distributions...</p></div>;
  if (error) return <div className="error-card">{error}</div>;
  if (!activityData) return null;

  const { contributors } = activityData;

  const currentDev = contributors.find(c => c.login === activeContributor);

  // Format hour distribution for radar chart
  const radarData = currentDev ? currentDev.hourDistribution.map((count, hour) => ({
    hour: `${hour}:00`,
    commits: count
  })) : [];

  const getPersonaBadge = (label) => {
    switch (label) {
      case 'Night Owl':
        return { icon: <Moon size={12} />, bg: 'rgba(198, 68, 252, 0.15)', color: '#c644fc', border: '1px solid rgba(198, 68, 252, 0.3)' };
      case 'Early Bird':
        return { icon: <Sun size={12} />, bg: 'rgba(255, 183, 3, 0.15)', color: '#ffb703', border: '1px solid rgba(255, 183, 3, 0.3)' };
      case '9-to-5':
      default:
        return { icon: <Monitor size={12} />, bg: 'rgba(57, 211, 83, 0.15)', color: '#39d353', border: '1px solid rgba(57, 211, 83, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Contributors List Selector */}
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Contributors</h3>
          <p className="score-desc" style={{ marginBottom: '10px' }}>Select a contributor to view their 24h work patterns.</p>
          {contributors.map((c) => {
            const badge = getPersonaBadge(c.label);
            return (
              <button
                key={c.login}
                className={`tab-btn ${activeContributor === c.login ? 'active' : ''}`}
                onClick={() => setActiveContributor(c.login)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderLeft: activeContributor === c.login ? '3px solid var(--accent)' : 'none',
                  background: activeContributor === c.login ? 'var(--accent-glow)' : 'transparent',
                  borderRadius: '6px'
                }}
              >
                <span>{c.login}</span>
                <span className="persona-badge" style={{ 
                  backgroundColor: badge.bg, 
                  color: badge.color, 
                  border: badge.border, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  margin: 0,
                  fontSize: '10px'
                }}>
                  {badge.icon} {c.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Polar Radar Chart */}
        {currentDev && (
          <div className="card glass-panel text-center">
            <h3>24h Commit Clock Distribution: {currentDev.login}</h3>
            <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="hour" stroke="var(--muted)" fontSize={10} />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" fontSize={9} />
                  <Radar name="Commits" dataKey="commits" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(11, 11, 14, 0.95)', border: '1px solid var(--border)' }}
                    labelStyle={{ color: 'var(--muted)', fontSize: '11px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="score-desc" style={{ marginTop: '12px' }}>
              Peak working hour detected at <strong>{currentDev.peakHour}:00</strong>. Designated as an active <strong>{currentDev.label}</strong>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
