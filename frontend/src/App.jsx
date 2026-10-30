import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  GitBranch, GitPullRequest, ShieldAlert, Cpu, BarChart2, 
  GitCompare, Settings, PlayCircle, Layers, Users, FileText, Download,
  Award, Flame, Smile, Trophy, Clock, Building, Box, Copy, RotateCcw
} from 'lucide-react';
import LanguageChart from './component/LanguageChart.jsx';
import DependencyGraph from './component/DependencyGraph.jsx';
import ContributorHeatmap from './component/ContributorHeatmap.jsx';
import CommitActivityChart from './component/CommitActivityChart.jsx';
import CommitGraph from './component/CommitGraph.jsx';
import BranchCompare from './component/BranchCompare.jsx';
import FileHotspots from './component/FileHotspots.jsx';
import PRTracker from './component/PRTracker.jsx';
import TimelinePlayback from './component/TimelinePlayback.jsx';
import CollaborationMap from './component/CollaborationMap.jsx';
import CodeQualityMetrics from './component/CodeQualityMetrics.jsx';
import AIInsights from './component/AIInsights.jsx';
import FileTree from './FileTree.jsx';
import { Toaster, toast } from 'react-hot-toast';
import DotBackground from './component/DotBackground.jsx';
import { MinecraftHealthBar, MinecraftExpBar } from './component/MinecraftCompanion.jsx';
import html2canvas from 'html2canvas';

// Import Additional Components
import HealthScore from './component/HealthScore.jsx';
import DeveloperPersonas from './component/DeveloperPersonas.jsx';
import BattleMode from './component/BattleMode.jsx';
import BusFactor from './component/BusFactor.jsx';
import OnboardingGuide from './component/OnboardingGuide.jsx';

// Import MERN components
import CommitSentiment from './components/CommitSentiment.jsx';
import CodeChurn from './components/CodeChurn.jsx';
import ReleaseVelocity from './components/ReleaseVelocity.jsx';
import NightOwlEarlyBird from './components/NightOwlEarlyBird.jsx';
import RepoReportCard from './components/RepoReportCard.jsx';
import GithubWrapped from './components/GithubWrapped.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import PrChecklist from './components/PrChecklist.jsx';
import VulnerabilityScanner from './components/VulnerabilityScanner.jsx';
import StreakTracker from './components/StreakTracker.jsx';
import OrgDashboard from './components/OrgDashboard.jsx';
import WeeklyDigest from './components/WeeklyDigest.jsx';
import TeamVelocity from './components/TeamVelocity.jsx';
import UserDashboard from './components/UserDashboard.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [modalAlert, setModalAlert] = useState(null);

  const triggerThemedAlert = (message, title = 'NOTIFICATION', type = 'info') => {
    setModalAlert({ message, title, type });
  };

  // Intercept native browser alert() to use our Neo-Brutalist B&W themed dialog
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      triggerThemedAlert(msg, 'NOTIFICATION', 'info');
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Auto-dismiss success banners after 6 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const [data, setData] = useState({
    repoInfo: null,
    languages: {},
    dependencies: {},
    commitHistory: [],
    contributors: [],
    commitActivity: [],
    fileTree: [],
    prs: [],
    issues: [],
    branches: [],
    fileHotspots: [],
  });

  // Timeline filtered commits
  const [timelineCommits, setTimelineCommits] = useState([]);

  // URL Auth callbacks with immediate token wiping for data leak prevention
  useEffect(() => {
    // Check both hash fragment (#token=...) and query parameters (?token=...)
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash);

    const urlToken = hashParams.get('token') || searchParams.get('token');
    const mockToken = hashParams.get('mockToken') || searchParams.get('mockToken');
    const loginUser = hashParams.get('login') || searchParams.get('login');
    const avatarUser = hashParams.get('avatar') || searchParams.get('avatar');

    if (urlToken) {
      localStorage.setItem('token', urlToken);
      setToken(urlToken);
      try {
        const base64Url = urlToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        localStorage.setItem('user', JSON.stringify(payload));
        setUser(payload);
        toast.success('Successfully logged in with GitHub!');
      } catch (e) {
        console.error('Token validation error:', e.message);
      }
      // Instantly wipe token from browser URL bar to prevent token leakage in history, referrers, or logs
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (mockToken) {
      const mockUser = { login: loginUser || 'DemoDeveloper', avatar: avatarUser || '' };
      localStorage.setItem('token', 'mock_token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setToken('mock_token');
      setUser(mockUser);
      toast.success('Successfully logged in (Demo Mode)!');
      // Instantly wipe token from browser URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const saveAnalysis = async (url, score) => {
    if (!token) return;
    try {
      await axios.post(`${BACKEND_URL}/api/auth/repos`, { repoUrl: url, healthScore: score }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Analysis saved to your profile!');
    } catch (err) {
      console.error('Failed to save analysis:', err);
    }
  };

  async function analyzeRepo(e) {
    if (e) e.preventDefault();
    if (!repoUrl) return;
    setError('');
    setLoading(true);
    const startTime = Date.now();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/analyze-repo`, { repoUrl });
      const healthRes = await axios.post(`${BACKEND_URL}/api/health-score`, { repoUrl }).catch(() => ({ data: { score: 80 } }));
      
      // Enforce at least 2 seconds (2000ms) loading animation display
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
      }

      setData(res.data);
      setTimelineCommits(res.data.commitHistory || []);
      saveAnalysis(repoUrl, healthRes.data.score);
      setSuccessMessage('Repository analyzed successfully! Ready to explore modules.');
      toast.success('Repository analyzed successfully! ⛏️');
    } catch (err) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
      }
      setError(err?.response?.data?.msg || err.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  }

  const loadDemo = async () => {
    const demoUrl = 'https://github.com/demo/demo';
    setRepoUrl(demoUrl);
    setError('');
    setLoading(true);
    const startTime = Date.now();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/analyze-repo`, { repoUrl: demoUrl });
      // Enforce at least 2 seconds (2000ms) loading animation display
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
      }
      setData(res.data);
      setTimelineCommits(res.data.commitHistory || []);
      saveAnalysis(demoUrl, 82);
      setSuccessMessage('Loaded demo repository workspace! 💎');
      toast.success('Loaded demo repository workspace! 💎');
    } catch (err) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
      }
      setError('Failed to load demo data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!repoUrl) {
      toast.error('No repository URL to copy!');
      return;
    }
    navigator.clipboard.writeText(repoUrl);
    setSuccessMessage('Repository link copied to clipboard! 📋');
    toast.success('Repository link copied to clipboard! 📋');
  };

  const handleReset = () => {
    setRepoUrl('');
    setData({
      repoInfo: null,
      languages: {},
      dependencies: {},
      commitHistory: [],
      contributors: [],
      commitActivity: [],
      fileTree: [],
      prs: [],
      issues: [],
      branches: [],
      fileHotspots: [],
    });
    setTimelineCommits([]);
    setError('');
    setSuccessMessage('Workspace cleared and reset successfully.');
    toast.success('Dashboard cleared.');
  };

  const exportDashboard = async () => {
    if (!data.repoInfo && activeTab !== 'battle' && activeTab !== 'org' && activeTab !== 'leaderboard') {
      toast.error('No repository data to export! Please load a repository first.');
      triggerThemedAlert(
        'No repository data is currently loaded. Please enter a GitHub repository URL or click "Load Demo Data" before exporting a report.',
        'CANNOT EXPORT REPORT',
        'warning'
      );
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading('Generating high-resolution report image...');

    try {
      const targetElement = document.getElementById('dashboard-tab-content') || 
                            document.querySelector('.tab-content') || 
                            document.querySelector('.dashboard-container');
      
      if (!targetElement) {
        throw new Error('Dashboard container element not found.');
      }

      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('dashboard-tab-content') || clonedDoc.querySelector('.tab-content');
          if (el) {
            el.style.height = 'auto';
            el.style.maxHeight = 'none';
            el.style.overflow = 'visible';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const repoName = data.repoInfo 
        ? `${data.repoInfo.owner}_${data.repoInfo.repo}`
        : (repoUrl ? repoUrl.replace(/[^a-zA-Z0-9]/g, '_') : 'repository');
      const filename = `${repoName}_${activeTab}_report.png`;

      const downloadLink = document.createElement('a');
      downloadLink.href = imgData;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success(`Exported: ${filename} 📸`, { id: toastId });
      setSuccessMessage(`Dashboard report exported and downloaded as ${filename}`);
      triggerThemedAlert(
        `Your dashboard report "${filename}" has been generated and saved to your Downloads folder!`,
        'EXPORT SUCCESSFUL',
        'success'
      );
    } catch (err) {
      console.error('Failed to capture PNG:', err);
      // Fallback: download JSON report summary
      try {
        const repoName = data.repoInfo ? `${data.repoInfo.owner}_${data.repoInfo.repo}` : 'repository';
        const filename = `${repoName}_${activeTab}_summary.json`;
        const exportData = {
          repository: data.repoInfo,
          activeTab,
          exportedAt: new Date().toISOString(),
          languages: data.languages,
          commitHistoryCount: data.commitHistory?.length || 0,
          contributorsCount: data.contributors?.length || 0,
          summary: "Git Repository Visualizer Exported Report Data"
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded report data as ${filename}!`, { id: toastId });
      } catch (fallbackErr) {
        toast.error('Failed to export dashboard report.', { id: toastId });
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Listen for query parameter tab updates
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const handleLoadSavedRepo = async (url) => {
    setRepoUrl(url);
    setError('');
    setLoading(true);
    const startTime = Date.now();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/analyze-repo`, { repoUrl: url });
      // Enforce at least 2 seconds (2000ms) loading animation display
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
      }
      setData(res.data);
      setTimelineCommits(res.data.commitHistory || []);
      setActiveTab('overview');
    } catch (err) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
      }
      setError('Failed to load saved repository.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Layers size={15} /> },
    { id: 'health', name: 'Health Score', icon: <Award size={15} /> },
    { id: 'battle', name: 'Battle Mode', icon: <Flame size={15} /> },
    { id: 'commits', name: 'Commit Graph', icon: <GitBranch size={15} /> },
    { id: 'playback', name: 'Timeline Playback', icon: <PlayCircle size={15} /> },
    { id: 'compare', name: 'Branch Compare', icon: <GitCompare size={15} /> },
    { id: 'prs', name: 'PRs & Issues', icon: <GitPullRequest size={15} /> },
    { id: 'contributors', name: 'Contributors', icon: <Users size={15} /> },
    { id: 'quality', name: 'Code Quality', icon: <Cpu size={15} /> },
    { id: 'dependencies', name: 'Dependencies', icon: <ShieldAlert size={15} /> },
    { id: 'sentiment', name: 'Sentiment', icon: <Smile size={15} /> },
    { id: 'churn', name: 'Churn Heatmap', icon: <Flame size={15} /> },
    { id: 'releases', name: 'Release Velocity', icon: <PlayCircle size={15} /> },
    { id: 'activity-patterns', name: 'Activity Clock', icon: <Clock size={15} /> },
    { id: 'report-card', name: 'PDF Report Card', icon: <FileText size={15} /> },
    { id: 'wrapped', name: 'Wrapped 2024', icon: <Award size={15} /> },
    { id: 'leaderboard', name: 'Leaderboard', icon: <Trophy size={15} /> },
    { id: 'pr-checklist', name: 'PR Checklist', icon: <Layers size={15} /> },
    { id: 'vulnerabilities', name: 'Vulnerabilities', icon: <ShieldAlert size={15} /> },
    { id: 'streaks', name: 'Commit Streaks', icon: <Flame size={15} /> },
    { id: 'org', name: 'Org Dashboard', icon: <Building size={15} /> },
    { id: 'velocity', name: 'Team Velocity', icon: <BarChart2 size={15} /> },
    { id: 'onboarding', name: 'Onboarding Guide', icon: <FileText size={15} /> },
    { id: 'ai', name: 'AI Insights', icon: <Cpu size={15} /> },
    { id: 'profile', name: 'My Profile', icon: <Users size={15} /> }
  ];

  const owner = data.repoInfo?.owner || '';
  const repo = data.repoInfo?.repo || '';

  return (
    <div className="app theme-bw">
      <DotBackground />
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bw-neo-toast',
          duration: 4500,
          style: {
            background: '#ffffff',
            color: '#000000',
            border: '2.5px solid #000000',
            borderRadius: '0px',
            boxShadow: '4px 4px 0px #000000',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            fontWeight: '700',
            padding: '12px 16px',
            letterSpacing: '-0.2px',
          },
          success: {
            iconTheme: {
              primary: '#000000',
              secondary: '#ffffff',
            },
            style: {
              borderLeft: '8px solid #000000',
            }
          },
          error: {
            iconTheme: {
              primary: '#000000',
              secondary: '#ffffff',
            },
            style: {
              borderLeft: '8px solid #000000',
            }
          }
        }}
      />
      
      {/* 55 Domino Falling Bars Loading Animation (Enforced 2-second duration) */}
      {loading && (
        <div className="domino-loading-overlay" aria-live="polite">
          <div className="domino-loading-box">
            <div className="ld-domino" aria-label="Loading animation">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </div>
            <span className="domino-loading-text">LOADING REPOSITORY DATA...</span>
            <span className="domino-loading-subtext">Fetching commits, branches & modules</span>
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <header className="header glass-panel">
        <div className="title-row">
          <div>
            <h1>
              <Box size={22} style={{ flexShrink: 0 }} />
              Git Repository Visualizer
            </h1>
            <div className="subtitle-bw">Minimal Black/White Developer Dashboard · Minecraft Edition</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button className="demo-btn" onClick={loadDemo}>Load Demo Data</button>
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={user.avatar} 
                  alt={user.login} 
                  style={{ width: '32px', height: '32px', borderRadius: '0px', border: '2px solid #000' }} 
                  title={user.login}
                />
                <button className="demo-btn" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <button 
                className="demo-btn" 
                onClick={() => setActiveTab('profile')}
              >
                Login with GitHub
              </button>
            )}
          </div>
        </div>

        {/* Input Form matching reference image */}
        <form onSubmit={analyzeRepo} className="input-row">
          <input
            type="url"
            placeholder="https://github.com/owner/repo (Paste Repository URL)"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Analyze Repository'}</button>
        </form>

        {/* Action Toolbar Row matching reference image */}
        <div className="toolbar-action-row">
          <div className="action-btn-group">
            <button type="button" className="toolbar-btn" onClick={handleCopyUrl} title="Copy Repository Link">
              <Copy size={13} /> Copy Repo URL
            </button>
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={exportDashboard} 
              title="Export Dashboard Report"
              disabled={isExporting}
            >
              <Download size={13} /> {isExporting ? 'Exporting…' : 'Export Report'}
            </button>
            <button type="button" className="toolbar-btn danger" onClick={handleReset} title="Reset Dashboard">
              <RotateCcw size={13} /> Reset All
            </button>
          </div>

          <div className="stats-badge-row">
            {data.repoInfo ? (
              <>
                <span className="stat-pill">Repo: {data.repoInfo.owner}/{data.repoInfo.repo}</span>
                <span className="stat-pill">Branch: {data.repoInfo.defaultBranch}</span>
                <MinecraftHealthBar score={88} />
              </>
            ) : (
              <>
                <span className="stat-pill">Status: Ready</span>
                <span className="stat-pill">Theme: Monochrome B&W</span>
              </>
            )}
          </div>
        </div>

        {/* Status Messages strictly adhering to Black & White Neo-Brutalist Theme */}
        {error && (
          <div className="status-banner error-banner" role="alert">
            <div className="banner-content">
              <span className="banner-tag error-tag">[!] ERROR</span>
              <span className="banner-text">{error}</span>
            </div>
            <button 
              type="button" 
              className="banner-close-btn" 
              onClick={() => setError('')} 
              title="Dismiss error message"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="status-banner success-banner" role="status">
            <div className="banner-content">
              <span className="banner-tag success-tag">[✔] SUCCESS</span>
              <span className="banner-text">{successMessage}</span>
            </div>
            <button 
              type="button" 
              className="banner-close-btn" 
              onClick={() => setSuccessMessage('')} 
              title="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}
      </header>

      {((data.repoInfo && activeTab !== 'org' && activeTab !== 'leaderboard' && activeTab !== 'profile') || activeTab === 'battle' || activeTab === 'org' || activeTab === 'leaderboard' || activeTab === 'profile') && (
        <div className="dashboard-container">
          <aside className="sidebar glass-panel" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="sidebar-groups-header">
              <span>GROUPS / MODULES</span>
              <Box size={14} />
            </div>
            {tabs.map(tab => {
              const isGraph = tab.id === 'commits';
              return (
                <button 
                  key={tab.id} 
                  className={`tab-btn ${isGraph ? 'tab-graph-btn' : ''} ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    const newUrl = `${window.location.origin}${window.location.pathname}?tab=${tab.id}`;
                    window.history.pushState({ path: newUrl }, '', newUrl);
                  }}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                  {isGraph && <span className="graph-badge">GRAPH</span>}
                </button>
              );
            })}
          </aside>

          <main className="tab-content" id="dashboard-tab-content">
            {activeTab === 'overview' && (
              <div className="grid">
                {/* Developer Overview Banner */}
                <section className="card wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 6px 0', border: 'none' }}>Developer Overview</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                      High-contrast neo-brutalist dashboard active.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <MinecraftHealthBar score={data.repoInfo ? 88 : 100} />
                    <MinecraftExpBar level={data.commitHistory?.length || 42} progress={74} />
                  </div>
                </section>

                <section className="card">
                  <h2>Language Distribution</h2>
                  <LanguageChart languages={data.languages} />
                </section>
                <section className="card">
                  <h2>Recent Commit Activity</h2>
                  <CommitActivityChart activity={data.commitActivity} />
                </section>
                <section className="card wide">
                  <h2>File Tree Structure</h2>
                  <FileTree files={data.fileTree} />
                </section>
                <section className="card wide">
                  <WeeklyDigest repoUrl={repoUrl} />
                </section>
              </div>
            )}

            {activeTab === 'health' && (
              <div className="grid-single">
                <section className="card">
                  <h2>Repository Health Score</h2>
                  <div style={{ marginBottom: '16px' }}>
                    <MinecraftHealthBar score={88} />
                  </div>
                  <HealthScore repoUrl={repoUrl} />
                </section>
              </div>
            )}

            {activeTab === 'battle' && (
              <div className="grid-single">
                <BattleMode />
              </div>
            )}

            {activeTab === 'commits' && (
              <div className="grid-single">
                <section className="card">
                  <h2>Interactive Commit Network Graph</h2>
                  <CommitGraph commits={data.commitHistory} defaultBranch={data.repoInfo?.defaultBranch || 'main'} />
                </section>
              </div>
            )}

            {activeTab === 'playback' && (
              <div className="grid-single">
                <section className="card">
                  <h2>Timeline Playback Controls</h2>
                  <TimelinePlayback commits={data.commitHistory} onFilteredCommitsChange={setTimelineCommits} />
                </section>
                <section className="card">
                  <h2>Historical Commit Evolution</h2>
                  <CommitGraph commits={timelineCommits} defaultBranch={data.repoInfo?.defaultBranch || 'main'} />
                </section>
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="grid-single">
                <section className="card">
                  <h2>Compare Branches & Highlight Conflicts</h2>
                  <BranchCompare repoUrl={repoUrl} branches={data.branches || ['main']} />
                </section>
              </div>
            )}

            {activeTab === 'prs' && (
              <div className="grid">
                <section className="card">
                  <h2>Pull Requests</h2>
                  <PRTracker prs={data.prs} />
                </section>
                <section className="card">
                  <h2>Linked Issue Tracker</h2>
                  <div className="issues-list">
                    {data.issues?.map(issue => (
                      <div key={issue.id} className="issue-card glass-panel">
                        <div className="issue-header">
                          <span className="title">#{issue.id}: {issue.title}</span>
                          <span className={`badge ${issue.state}`}>{issue.state}</span>
                        </div>
                        <div className="issue-meta">
                          <span>Reported by <strong>{issue.user}</strong></span>
                          <span>Opened: {new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {(!data.issues || data.issues.length === 0) && (
                      <p className="no-data">No open or closed issues found.</p>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'contributors' && (
              <div className="grid-single">
                <section className="card">
                  <h2>Contributor Activity Heatmap</h2>
                  <ContributorHeatmap contributors={data.contributors} commitHistory={data.commitHistory} />
                </section>
                <section className="card">
                  <h2>Developer Archetypes & Personas</h2>
                  <DeveloperPersonas contributors={data.contributors} />
                </section>
                <section className="card">
                  <h2>Knowledge Centralization (Bus Factor)</h2>
                  <BusFactor busFactorInfo={data.busFactorInfo} />
                </section>
                <section className="card">
                  <h2>File Co-Ownership & Collaboration Map</h2>
                  <CollaborationMap contributors={data.contributors} />
                </section>
              </div>
            )}

            {activeTab === 'quality' && (
              <div className="grid">
                <section className="card">
                  <h2>Code Quality & Maintenance Metrics</h2>
                  <CodeQualityMetrics />
                </section>
                <section className="card">
                  <h2>Codebase Modification Hotspots</h2>
                  <FileHotspots hotspots={data.fileHotspots} />
                </section>
              </div>
            )}

            {activeTab === 'dependencies' && (
              <div className="grid-single">
                <section className="card">
                  <h2>Package Dependencies & Vulnerability Graph</h2>
                  <DependencyGraph dependencies={data.dependencies} />
                </section>
              </div>
            )}

            {activeTab === 'sentiment' && (
              <div className="grid-single">
                <CommitSentiment owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'churn' && (
              <div className="grid-single">
                <CodeChurn owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'releases' && (
              <div className="grid-single">
                <ReleaseVelocity owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'activity-patterns' && (
              <div className="grid-single">
                <NightOwlEarlyBird owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'report-card' && (
              <div className="grid-single">
                <RepoReportCard 
                  owner={owner} 
                  repo={repo} 
                  stats={{
                    healthScore: 82,
                    busFactor: data.busFactorInfo?.busFactor || 2,
                    contributorCount: data.contributors?.length || 4,
                    commitFrequency: data.commitHistory?.length || 24,
                    primaryLanguage: Object.keys(data.languages || {})[0] || 'TypeScript',
                    topContributor: data.contributors?.[0]?.login || 'Developer'
                  }} 
                />
              </div>
            )}

            {activeTab === 'wrapped' && (
              <div className="grid-single">
                <GithubWrapped owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="grid-single">
                <Leaderboard />
              </div>
            )}

            {activeTab === 'pr-checklist' && (
              <div className="grid-single">
                <PrChecklist owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'vulnerabilities' && (
              <div className="grid-single">
                <VulnerabilityScanner owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'streaks' && (
              <div className="grid-single">
                <StreakTracker owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'org' && (
              <div className="grid-single">
                <OrgDashboard />
              </div>
            )}

            {activeTab === 'velocity' && (
              <div className="grid-single">
                <TeamVelocity owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'onboarding' && (
              <div className="grid-single">
                <OnboardingGuide 
                  repoUrl={repoUrl} 
                  dependencies={data.dependencies} 
                  fileTree={data.fileTree} 
                  issues={data.issues} 
                />
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="grid-single">
                <section className="card">
                  <h2>AI-Powered Insights</h2>
                  <AIInsights 
                    repoUrl={repoUrl} 
                    languages={data.languages} 
                    contributors={data.contributors} 
                    commitHistory={data.commitHistory} 
                  />
                </section>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="grid-single">
                <UserDashboard 
                  token={token} 
                  user={user} 
                  onLogin={(t, u) => {
                    localStorage.setItem('token', t);
                    localStorage.setItem('user', JSON.stringify(u));
                    setToken(t);
                    setUser(u);
                  }} 
                  onLogout={handleLogout} 
                  onLoadRepo={handleLoadSavedRepo} 
                />
              </div>
            )}
          </main>
        </div>
      )}

      {!data.repoInfo && activeTab !== 'battle' && activeTab !== 'org' && activeTab !== 'leaderboard' && activeTab !== 'profile' && (
        <div className="empty-state">
          <Layers size={48} className="empty-icon" />
          <h2>Welcome to Git Repository Visualizer</h2>
          <p>Provide a public GitHub repository link above to start or load sample data directly.</p>
        </div>
      )}

      <footer className="footer">
        <span>Backend: {BACKEND_URL} · Minimal Black & White Neo-Brutalist Edition</span>
      </footer>

      {/* Black & White Neo-Brutalist Themed Alert Modal */}
      {modalAlert && (
        <div className="neo-modal-backdrop" onClick={() => setModalAlert(null)}>
          <div 
            className="neo-modal-window" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="neo-modal-header">
              <div className="neo-modal-title">
                <span className="neo-modal-icon">⛏️</span>
                <span>{modalAlert.title || 'SYSTEM NOTIFICATION'}</span>
              </div>
              <button 
                type="button" 
                className="neo-modal-close" 
                onClick={() => setModalAlert(null)}
                title="Close"
              >
                ×
              </button>
            </div>
            
            <div className="neo-modal-body">
              <p className="neo-modal-text">{modalAlert.message}</p>
            </div>
            
            <div className="neo-modal-footer">
              <button 
                type="button" 
                className="neo-modal-btn" 
                onClick={() => {
                  if (modalAlert.onConfirm) modalAlert.onConfirm();
                  setModalAlert(null);
                }}
                autoFocus
              >
                [ OK / DISMISS ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
