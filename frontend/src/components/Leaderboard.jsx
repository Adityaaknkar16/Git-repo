import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, RefreshCw, Star, Layers, ExternalLink } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function Leaderboard() {
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [filterLang, setFilterLang] = useState('All');
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${BACKEND_URL}/api/social/leaderboard`);
      setRepos(res.data);
    } catch (err) {
      setError('Failed to fetch leaderboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getLanguages = () => {
    const list = new Set(['All']);
    repos.forEach(r => {
      if (r.language) list.add(r.language);
    });
    return Array.from(list);
  };

  const filteredRepos = filterLang === 'All' 
    ? repos 
    : repos.filter(r => r.language === filterLang);

  return (
    <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={24} color="#ffb703" />
          <h2 style={{ margin: 0 }}>Global Repository Leaderboard</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            value={filterLang} 
            onChange={(e) => setFilterLang(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
          >
            {getLanguages().map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <button className="copy-btn" onClick={fetchLeaderboard}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="health-loading"><div className="spinner"></div></div>
      ) : error ? (
        <div className="error-card">{error}</div>
      ) : filteredRepos.length === 0 ? (
        <p className="text-muted text-center" style={{ padding: '30px' }}>No repositories submitted yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '12px 8px' }}>Rank</th>
                <th style={{ padding: '12px 8px' }}>Repository</th>
                <th style={{ padding: '12px 8px' }}>Language</th>
                <th style={{ padding: '12px 8px' }}>Health Score</th>
                <th style={{ padding: '12px 8px' }}>Stars</th>
                <th style={{ padding: '12px 8px' }}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepos.map((repo, idx) => (
                <tr key={repo._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', hover: { background: 'rgba(255,255,255,0.01)' } }}>
                  <td style={{ padding: '12px 8px', fontWeight: '800', color: idx === 0 ? '#ffb703' : 'var(--text)' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <a 
                      href={repo.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                    >
                      {repo.repoUrl.replace('https://github.com/', '')} <ExternalLink size={11} color="var(--muted)" />
                    </a>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className="badge" style={{ fontSize: '9px', padding: '2px 6px' }}>{repo.language}</span>
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: '800', color: repo.healthScore >= 80 ? '#39d353' : (repo.healthScore >= 60 ? '#ffb703' : '#ff5555') }}>
                    {repo.healthScore}/100
                  </td>
                  <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                    <Star size={11} fill="#ffb703" color="#ffb703" /> {repo.stars?.toLocaleString() || 0}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--muted)' }}>
                    {new Date(repo.lastActive || repo.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
