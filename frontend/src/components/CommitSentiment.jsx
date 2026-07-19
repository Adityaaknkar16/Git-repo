/**
 * CommitSentiment Component
 * Renders sentiment analysis charts based on commit messages.
 * Utilizes commit logs to map team morale trends over release cycles.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Smile, Frown, Award } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function CommitSentiment({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!owner || !repo) return;
    
    const fetchSentiment = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/analytics/sentiment/${owner}/${repo}`);
        setSentimentData(res.data);
      } catch (err) {
        setError('Failed to fetch commit sentiment data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [owner, repo]);

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Running NLP sentiment analysis on commits...</p></div>;
  if (error) return <div className="error-card">{error}</div>;
  if (!sentimentData) return null;

  const { commits, topPositive, topNegative } = sentimentData;

  // Format data for chart
  const chartData = commits.map(c => ({
    date: new Date(c.date).toLocaleDateString(),
    score: c.score,
    message: c.message.length > 30 ? c.message.substring(0, 30) + '...' : c.message
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: '10px', border: '1px solid var(--border)', background: 'rgba(11, 11, 14, 0.95)' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>{payload[0].payload.date}</p>
          <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: '700', color: payload[0].payload.score >= 0 ? '#39d353' : '#ff5555' }}>
            Score: {payload[0].payload.score}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'white', maxWidth: '200px', wordBreak: 'break-word' }}>
            {payload[0].payload.message}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card glass-panel">
        <h3>Commit Mood Score Over Time</h3>
        <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--muted)" fontSize={11} />
              <YAxis stroke="var(--muted)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="var(--accent)" 
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid">
        {/* Positive Commits */}
        <div className="card glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#39d353' }}>
            <Smile size={20} /> Most Positive Updates
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {topPositive.map((c, idx) => (
              <div key={idx} className="issue-card" style={{ borderLeft: '3px solid #39d353' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>{new Date(c.date).toLocaleDateString()}</span>
                  <span style={{ color: '#39d353', fontWeight: '700' }}>Score: +{c.score}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'white' }}>{c.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Negative Commits */}
        <div className="card glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff5555' }}>
            <Frown size={20} /> Most Frustrated Updates
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {topNegative.map((c, idx) => (
              <div key={idx} className="issue-card" style={{ borderLeft: '3px solid #ff5555' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>{new Date(c.date).toLocaleDateString()}</span>
                  <span style={{ color: '#ff5555', fontWeight: '700' }}>Score: {c.score}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'white' }}>{c.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
