import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Download, CheckSquare, Square } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function TeamVelocity({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [velocityData, setVelocityData] = useState([]);
  const [weeks, setWeeks] = useState(12);
  const [activeMetrics, setActiveMetrics] = useState({
    commitCount: true,
    prsOpened: true,
    prsMerged: true,
    avgPrMergeTime: false,
    activeContributors: false
  });
  const [error, setError] = useState('');

  const fetchVelocity = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${BACKEND_URL}/api/enterprise/velocity/${owner}/${repo}?weeks=${weeks}`);
      setVelocityData(res.data);
    } catch (err) {
      setError('Failed to fetch team velocity statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (owner && repo) {
      fetchVelocity();
    }
  }, [owner, repo, weeks]);

  const toggleMetric = (key) => {
    setActiveMetrics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const exportCSV = () => {
    if (velocityData.length === 0) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Week Start,Commits,PRs Opened,PRs Merged,Avg PR Merge Time (days),Active Contributors\n';
    
    velocityData.forEach(w => {
      csvContent += `${w.weekStart},${w.commitCount},${w.prsOpened},${w.prsMerged},${w.avgPrMergeTime},${w.activeContributors}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${owner}_${repo}_velocity_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Calculating team velocity averages over last {weeks} weeks...</p></div>;
  if (error) return <div className="error-card">{error}</div>;

  // Calculate stats summaries
  let avgCommits = 0;
  let avgMergeTime = 0;
  if (velocityData.length > 0) {
    const totalCommits = velocityData.reduce((acc, w) => acc + w.commitCount, 0);
    avgCommits = Math.round(totalCommits / velocityData.length);

    const totalMergeTime = velocityData.reduce((acc, w) => acc + w.avgPrMergeTime, 0);
    avgMergeTime = Math.round((totalMergeTime / velocityData.length) * 10) / 10;
  }

  // Trend detection (comparing first half to second half)
  let isImproving = true;
  if (velocityData.length >= 4) {
    const half = Math.floor(velocityData.length / 2);
    const firstHalfCommits = velocityData.slice(0, half).reduce((acc, w) => acc + w.commitCount, 0);
    const secondHalfCommits = velocityData.slice(half).reduce((acc, w) => acc + w.commitCount, 0);
    isImproving = secondHalfCommits >= firstHalfCommits;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Metrics Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card glass-panel text-center">
          <span className="text-muted" style={{ fontSize: '11px', fontWeight: '700' }}>AVG COMMITS / WEEK</span>
          <div style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0' }}>{avgCommits}</div>
        </div>

        <div className="card glass-panel text-center">
          <span className="text-muted" style={{ fontSize: '11px', fontWeight: '700' }}>AVG PR MERGE TIME</span>
          <div style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0', color: '#ffb703' }}>{avgMergeTime} days</div>
        </div>

        <div className="card glass-panel text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span className="text-muted" style={{ fontSize: '11px', fontWeight: '700' }}>VELOCITY TREND</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '20px', fontWeight: '800', color: isImproving ? '#39d353' : '#ff5555', marginTop: '6px' }}>
            {isImproving ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {isImproving ? 'Improving' : 'Declining'}
          </div>
        </div>
      </div>

      {/* Main velocity panel */}
      <div className="card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>Team Development Velocity</h3>
            <p className="score-desc" style={{ marginTop: '2px' }}>Visualizes commits, PR activities, and collaboration metrics.</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              value={weeks} 
              onChange={(e) => setWeeks(parseInt(e.target.value) || 12)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '12px' }}
            >
              <option value={6}>6 Weeks</option>
              <option value={12}>12 Weeks</option>
              <option value={24}>24 Weeks</option>
            </select>
            <button onClick={exportCSV} className="copy-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Legend filters */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {[
            { key: 'commitCount', label: 'Commits', color: '#5856d6' },
            { key: 'prsOpened', label: 'PRs Opened', color: '#c644fc' },
            { key: 'prsMerged', label: 'PRs Merged', color: '#39d353' },
            { key: 'avgPrMergeTime', label: 'PR Merge Time (days)', color: '#ffb703' },
            { key: 'activeContributors', label: 'Active Contributors', color: '#06b6d4' }
          ].map((m) => (
            <div 
              key={m.key} 
              onClick={() => toggleMetric(m.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', userSelect: 'none' }}
            >
              <div style={{ color: activeMetrics[m.key] ? m.color : 'var(--muted)' }}>
                {activeMetrics[m.key] ? <CheckSquare size={14} /> : <Square size={14} />}
              </div>
              <span style={{ color: activeMetrics[m.key] ? 'white' : 'var(--muted)', fontWeight: '600' }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Recharts chart */}
        <div style={{ width: '100%', height: 320, marginTop: '24px' }}>
          <ResponsiveContainer>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="weekStart" stroke="var(--muted)" fontSize={10} />
              <YAxis stroke="var(--muted)" fontSize={10} />
              <Tooltip contentStyle={{ background: 'rgba(11, 11, 14, 0.95)', border: '1px solid var(--border)' }} />
              {activeMetrics.commitCount && <Line type="monotone" dataKey="commitCount" stroke="#5856d6" strokeWidth={2} dot={{ r: 2 }} />}
              {activeMetrics.prsOpened && <Line type="monotone" dataKey="prsOpened" stroke="#c644fc" strokeWidth={2} dot={{ r: 2 }} />}
              {activeMetrics.prsMerged && <Line type="monotone" dataKey="prsMerged" stroke="#39d353" strokeWidth={2} dot={{ r: 2 }} />}
              {activeMetrics.avgPrMergeTime && <Line type="monotone" dataKey="avgPrMergeTime" stroke="#ffb703" strokeWidth={2} dot={{ r: 2 }} />}
              {activeMetrics.activeContributors && <Line type="monotone" dataKey="activeContributors" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
