/**
 * OrgDashboard Component
 * Consolidates analytics, repositories list, and overall velocity metrics
 * at the GitHub organization level.
 */
import React, { useState } from 'react';
import axios from 'axios';
import { Search, Download, Building, ExternalLink } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function OrgDashboard() {
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchOrgRepos = async (e) => {
    if (e) e.preventDefault();
    if (!orgName) return;

    setLoading(true);
    setError('');
    setOrgData(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/enterprise/org/${orgName}`);
      setOrgData(res.data);
    } catch (err) {
      setError('Failed to fetch organization repositories.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!orgData || orgData.repos.length === 0) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Name,Health Score,Language,Stars,Last Active,Bus Factor Risk\n';
    
    orgData.repos.forEach(r => {
      csvContent += `${r.name},${r.healthScore},${r.language},${r.stars},${new Date(r.lastActive).toLocaleDateString()},${r.busFactorRisk}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${orgName}_repositories_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRepos = orgData 
    ? orgData.repos.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card glass-panel">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={24} color="var(--accent)" /> Organization Analytics Dashboard
        </h2>
        <p className="text-muted" style={{ marginTop: '4px' }}>Load all repositories under a specific GitHub organization for unified reviews.</p>
        
        <form onSubmit={fetchOrgRepos} className="input-row" style={{ marginTop: '20px' }}>
          <input 
            type="text" 
            placeholder="Enter org name (e.g. facebook or demo)" 
            value={orgName} 
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Fetching...' : 'Load Org'}
          </button>
        </form>

        {error && <div className="error" style={{ marginTop: '12px' }}>{error}</div>}
      </div>

      {loading && (
        <div className="health-loading"><div className="spinner"></div><p>Querying organization repositories from GitHub...</p></div>
      )}

      {orgData && (
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building size={20} />
              <h3 style={{ margin: 0 }}>Repositories under {orgData.org} ({filteredRepos.length})</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--muted)' }} />
                <input 
                  type="text" 
                  placeholder="Filter by name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '6px 10px 6px 30px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                />
              </div>
              <button onClick={exportToCSV} className="copy-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                  <th style={{ padding: '10px 6px' }}>Repo Name</th>
                  <th style={{ padding: '10px 6px' }}>Health Score</th>
                  <th style={{ padding: '10px 6px' }}>Primary Language</th>
                  <th style={{ padding: '10px 6px' }}>Stars</th>
                  <th style={{ padding: '10px 6px' }}>Last Updated</th>
                  <th style={{ padding: '10px 6px' }}>Bus Factor Risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepos.map((r) => (
                  <tr key={r.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px 6px' }}>
                      <a 
                        href={`https://github.com/${orgData.org}/${r.name}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: 'white', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {r.name} <ExternalLink size={11} color="var(--muted)" />
                      </a>
                    </td>
                    <td style={{ padding: '12px 6px', fontWeight: '800', color: r.healthScore >= 80 ? '#39d353' : (r.healthScore >= 60 ? '#ffb703' : '#ff5555') }}>
                      {r.healthScore}/100
                    </td>
                    <td style={{ padding: '12px 6px' }}>
                      <span className="badge" style={{ fontSize: '9px', padding: '2px 6px' }}>{r.language}</span>
                    </td>
                    <td style={{ padding: '12px 6px' }}>{r.stars?.toLocaleString() || 0}</td>
                    <td style={{ padding: '12px 6px', color: 'var(--muted)' }}>{new Date(r.lastActive).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 6px', fontWeight: '700', color: r.busFactorRisk === 'Low' ? '#39d353' : (r.busFactorRisk === 'Medium' ? '#ffb703' : '#ff5555') }}>
                      {r.busFactorRisk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
