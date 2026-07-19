/**
 * UserDashboard Component
 * The main profile hub displaying OAuth state, connected repositories,
 * personal analysis logs, and subscription alerts.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, Calendar, AlertCircle, Trash2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const GithubIcon = ({ size = 18, ...props }) => (
  <svg
    height={size}
    width={size}
    viewBox="0 0 16 16"
    version="1.1"
    aria-hidden="true"
    fill="currentColor"
    {...props}
  >
    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export default function UserDashboard({ token, user, onLogin, onLogout, onLoadRepo }) {
  const [savedRepos, setSavedRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    
    const fetchSavedRepos = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auth/repos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedRepos(res.data);
      } catch (err) {
        setError('Failed to fetch saved repositories.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRepos();
  }, [token]);

  const handleLogin = () => {
    // Redirect to backend github route
    window.location.href = `${BACKEND_URL}/api/auth/github`;
  };

  const handleMockLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/mock-login`);
      onLogin(res.data.token, { login: res.data.login, avatar: res.data.avatar });
    } catch (err) {
      setError('Mock login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-dashboard">
      {!token ? (
        <div className="card glass-panel text-center" style={{ maxWidth: '500px', margin: '40px auto' }}>
          <GithubIcon size={48} className="empty-icon" style={{ alignSelf: 'center', margin: '20px 0', display: 'block' }} />
          <h2>Sync with GitHub</h2>
          <p className="text-muted" style={{ margin: '12px 0 24px' }}>
            Log in to save analyzed repositories, view comparative dashboard analytics, and build your custom portfolios.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="battle-btn-large" onClick={handleLogin} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <GithubIcon size={18} />
              Login with GitHub
            </button>
            <button className="demo-btn" onClick={handleMockLogin}>
              Quick Mock Login (Testing Mode)
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src={user?.avatar} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent)' }} />
              <div>
                <h2 style={{ margin: 0 }}>Welcome back, {user?.login}!</h2>
                <span className="text-muted" style={{ fontSize: '13px' }}>Successfully authenticated via GitHub</span>
              </div>
            </div>
            <button className="copy-btn" onClick={onLogout}>Logout</button>
          </div>

          <div className="card glass-panel">
            <h3>My Saved Repositories</h3>
            {loading ? (
              <div className="health-loading"><div className="spinner"></div></div>
            ) : error ? (
              <div className="error-card">{error}</div>
            ) : savedRepos.length === 0 ? (
              <div className="text-muted text-center" style={{ padding: '30px' }}>
                <Folder size={32} style={{ margin: '0 auto 10px' }} />
                No saved repositories yet. Automatically save analysis by loading a repo!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {savedRepos.map((repo, idx) => (
                  <div key={idx} className="stale-branch-card glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer' }} onClick={() => onLoadRepo(repo.repoUrl)}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: 'white', wordBreak: 'break-all' }}>
                      {repo.repoUrl.replace('https://github.com/', '')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)' }}>
                      <span>Score: <strong style={{ color: '#39d353' }}>{repo.healthScore}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(repo.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
