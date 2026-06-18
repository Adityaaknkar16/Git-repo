import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Calendar, ChevronRight, Activity } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function ReleaseVelocity({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [releaseData, setReleaseData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchReleases = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/analytics/releases/${owner}/${repo}`);
        setReleaseData(res.data);
      } catch (err) {
        setError('Failed to fetch release velocity details.');
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [owner, repo]);

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Calculating release cadences...</p></div>;
  if (error) return <div className="error-card">{error}</div>;
  if (!releaseData) return null;

  const { releases, avgVelocity } = releaseData;

  const chartData = releases.map(r => ({
    tag: r.tag,
    days: r.daysSincePrev,
    date: new Date(r.date).toLocaleDateString()
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Metric Card */}
        <div className="card glass-panel text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30px' }}>
          <Activity size={32} className="empty-icon" style={{ alignSelf: 'center', color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '48px', margin: '12px 0 4px', fontWeight: '800', color: 'white' }}>
            {avgVelocity} <span style={{ fontSize: '18px', fontWeight: '500', color: 'var(--muted)' }}>days</span>
          </h2>
          <span className="text-muted" style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Average Cadence between Releases
          </span>
          <p className="score-desc" style={{ marginTop: '12px' }}>
            Represents the overall deployment cadence. Lower values indicate high release velocity.
          </p>
        </div>

        {/* Bar Chart */}
        <div className="card glass-panel">
          <h3>Release Intervals (Days between releases)</h3>
          <div style={{ width: '100%', height: 260, marginTop: '20px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="tag" stroke="var(--muted)" fontSize={11} />
                <YAxis stroke="var(--muted)" fontSize={11} label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: 'var(--muted)', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(11, 11, 14, 0.95)', border: '1px solid var(--border)' }}
                  labelStyle={{ color: 'var(--muted)', fontSize: '11px' }}
                />
                <Bar dataKey="days" fill="var(--gradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Release Timeline */}
      <div className="card glass-panel">
        <h3>Release Timeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {releases.map((release, idx) => (
            <div key={idx} className="risky-file-item" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={15} color="var(--accent)" />
                <strong style={{ color: 'white' }}>{release.tag}</strong>
                <span className="text-muted" style={{ fontSize: '12px' }}>({new Date(release.date).toLocaleDateString()})</span>
              </div>
              <span style={{ fontSize: '13px', color: release.daysSincePrev > avgVelocity * 1.5 ? '#ffb703' : '#39d353' }}>
                {idx === 0 ? 'Initial release analyzed' : `${release.daysSincePrev} days since previous`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
