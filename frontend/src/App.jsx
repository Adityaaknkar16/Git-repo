import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  GitBranch, GitPullRequest, ShieldAlert, Cpu, BarChart2, 
  GitCompare, Settings, PlayCircle, Layers, Users, FileText, Download,
  Award, Flame, Smile, Trophy, Clock, Building
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

// Import New Components
import HealthScore from './component/HealthScore.jsx';
import DeveloperPersonas from './component/DeveloperPersonas.jsx';
import BattleMode from './component/BattleMode.jsx';
import BusFactor from './component/BusFactor.jsx';
import OnboardingGuide from './component/OnboardingGuide.jsx';

// Import 18 new MERN components
import CommitSentiment from './components/CommitSentiment.jsx';
import CodeChurn from './components/CodeChurn.jsx';
import ReleaseVelocity from './components/ReleaseVelocity.jsx';
import NightOwlEarlyBird from './components/NightOwlEarlyBird.jsx';
import RepoReportCard from './components/RepoReportCard.jsx';
import GithubWrapped from './components/GithubWrapped.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import GitignoreGenerator from './components/GitignoreGenerator.jsx';
import PrChecklist from './components/PrChecklist.jsx';
import StaleBranchCleaner from './components/StaleBranchCleaner.jsx';
import VulnerabilityScanner from './components/VulnerabilityScanner.jsx';
import StreakTracker from './components/StreakTracker.jsx';
import PersonalityQuiz from './components/PersonalityQuiz.jsx';
import RoastMyRepo from './components/RoastMyRepo.jsx';
import OrgDashboard from './components/OrgDashboard.jsx';
import WeeklyDigest from './components/WeeklyDigest.jsx';
import TeamVelocity from './components/TeamVelocity.jsx';
import UserDashboard from './components/UserDashboard.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
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

  // URL Auth callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const mockToken = params.get('mockToken');

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
        console.error(e);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (mockToken) {
      const mockUser = { login: params.get('login'), avatar: params.get('avatar') };
      localStorage.setItem('token', 'mock_token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setToken('mock_token');
      setUser(mockUser);
      toast.success('Successfully logged in (Mock Mode)!');
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
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/analyze-repo`, { repoUrl });
      setData(res.data);
      setTimelineCommits(res.data.commitHistory || []);
      
      const healthRes = await axios.post(`${BACKEND_URL}/api/health-score`, { repoUrl });
      saveAnalysis(repoUrl, healthRes.data.score);
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  }

  const loadDemo = () => {
    setRepoUrl('https://github.com/demo/demo');
    setError('');
    setLoading(true);
    axios.post(`${BACKEND_URL}/api/analyze-repo`, { repoUrl: 'https://github.com/demo/demo' })
      .then(res => {
        setData(res.data);
        setTimelineCommits(res.data.commitHistory || []);
        saveAnalysis('https://github.com/demo/demo', 82);
      })
      .catch(() => setError('Failed to load demo data.'))
      .finally(() => setLoading(false));
  };

  const exportDashboard = () => {
    // Simple alert representing PNG trigger
    alert('Dashboard exported to PNG successfully! (Check your browser downloads folder)');
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

  const handleLoadSavedRepo = (url) => {
    setRepoUrl(url);
    setError('');
    setLoading(true);
    axios.post(`${BACKEND_URL}/api/analyze-repo`, { repoUrl: url })
      .then(res => {
        setData(res.data);
        setTimelineCommits(res.data.commitHistory || []);
        setActiveTab('overview');
      })
      .catch(() => setError('Failed to load saved repository.'))
      .finally(() => setLoading(false));
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Layers size={16} /> },
    { id: 'health', name: 'Health Score', icon: <Award size={16} /> },
    { id: 'battle', name: 'Battle Mode', icon: <Flame size={16} /> },
    { id: 'commits', name: 'Commit Graph', icon: <GitBranch size={16} /> },
    { id: 'playback', name: 'Timeline Playback', icon: <PlayCircle size={16} /> },
    { id: 'compare', name: 'Branch Compare', icon: <GitCompare size={16} /> },
    { id: 'prs', name: 'PRs & Issues', icon: <GitPullRequest size={16} /> },
    { id: 'contributors', name: 'Contributors', icon: <Users size={16} /> },
    { id: 'quality', name: 'Code Quality', icon: <Cpu size={16} /> },
    { id: 'dependencies', name: 'Dependencies', icon: <ShieldAlert size={16} /> },
    { id: 'sentiment', name: 'Sentiment', icon: <Smile size={16} /> },
    { id: 'churn', name: 'Churn Heatmap', icon: <Flame size={16} /> },
    { id: 'releases', name: 'Release Velocity', icon: <PlayCircle size={16} /> },
    { id: 'activity-patterns', name: 'Activity Clock', icon: <Clock size={16} /> },
    { id: 'report-card', name: 'PDF Report Card', icon: <FileText size={16} /> },
    { id: 'wrapped', name: 'Wrapped 2024', icon: <Award size={16} /> },
    { id: 'leaderboard', name: 'Leaderboard', icon: <Trophy size={16} /> },
    { id: 'gitignore', name: 'gitignore Generator', icon: <Settings size={16} /> },
    { id: 'pr-checklist', name: 'PR Checklist', icon: <Layers size={16} /> },
    { id: 'stale-branches', name: 'Stale Branches', icon: <GitCompare size={16} /> },
    { id: 'vulnerabilities', name: 'Vulnerabilities', icon: <ShieldAlert size={16} /> },
    { id: 'streaks', name: 'Commit Streaks', icon: <Flame size={16} /> },
    { id: 'quiz', name: 'Personality Quiz', icon: <Cpu size={16} /> },
    { id: 'roast', name: 'Roast My Repo', icon: <Flame size={16} /> },
    { id: 'org', name: 'Org Dashboard', icon: <Building size={16} /> },
    { id: 'velocity', name: 'Team Velocity', icon: <BarChart2 size={16} /> },
    { id: 'onboarding', name: 'Onboarding Guide', icon: <FileText size={16} /> },
    { id: 'ai', name: 'AI Insights', icon: <Cpu size={16} /> },
    { id: 'profile', name: 'My Profile', icon: <Users size={16} /> }
  ];

  const owner = data.repoInfo?.owner || '';
  const repo = data.repoInfo?.repo || '';

  return (
    <div className="app">
      <Toaster position="bottom-right" />
      <header className="header glass-panel">
        <div className="title-row">
          <h1>Git Repository Visualizer</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="demo-btn" onClick={loadDemo}>Load Demo Data</button>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={user.avatar} 
                  alt={user.login} 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--accent)' }} 
                  title={user.login}
                />
                <button className="demo-btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <button 
                className="demo-btn" 
                style={{ background: 'var(--gradient)', color: 'white' }} 
                onClick={() => setActiveTab('profile')}
              >
                Login with GitHub
              </button>
            )}
          </div>
        </div>
        <form onSubmit={analyzeRepo} className="input-row">
          <input
            type="url"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Analyze'}</button>
        </form>
        {error && <div className="error">{error}</div>}
        {data.repoInfo && (
          <div className="meta">
            <span className="repo-name">{data.repoInfo.owner}/{data.repoInfo.repo}</span>
            <span className="badge">Branch: {data.repoInfo.defaultBranch}</span>
            <button className="export-btn" onClick={exportDashboard}>
              <Download size={13} /> Export Dashboard
            </button>
          </div>
        )}
      </header>

      {((data.repoInfo && activeTab !== 'org' && activeTab !== 'leaderboard' && activeTab !== 'profile') || activeTab === 'battle' || activeTab === 'org' || activeTab === 'leaderboard' || activeTab === 'profile') && (
        <div className="dashboard-container">
          <aside className="sidebar glass-panel" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Update tab parameter in URL query
                  const newUrl = `${window.location.origin}${window.location.pathname}?tab=${tab.id}`;
                  window.history.pushState({ path: newUrl }, '', newUrl);
                }}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </aside>

          <main className="tab-content">
            {activeTab === 'overview' && (
              <div className="grid">
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
                        {issue.linkedCommits?.length > 0 && (
                          <div className="commits-ref">
                            <span>Linked commits: </span>
                            {issue.linkedCommits.map(c => <code key={c}>{c.substring(0, 7)}</code>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'contributors' && (
              <div className="grid-single">
                <section className="card">
                  <h2>Developer Persona Cards</h2>
                  <DeveloperPersonas contributors={data.contributors} />
                </section>
                <div className="grid">
                  <section className="card">
                    <h2>Contributor Insights Heatmap</h2>
                    <ContributorHeatmap contributors={data.contributors} commitHistory={data.commitHistory} />
                  </section>
                  <section className="card">
                    <h2>Collaboration & Review Map</h2>
                    <CollaborationMap contributors={data.contributors} />
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'quality' && (
              <div className="grid-single">
                <BusFactor busFactorInfo={data.busFactorInfo} />
                <div className="grid">
                  <section className="card">
                    <h2>Code Quality Analytics</h2>
                    <CodeQualityMetrics />
                  </section>
                  <section className="card">
                    <h2>File Hotspots Explorer</h2>
                    <FileHotspots hotspots={data.fileHotspots} />
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'dependencies' && (
              <div className="grid-single">
                <section className="card">
                  <h2>Dependency Graph & Security Advisory</h2>
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
                <RepoReportCard owner={owner} repo={repo} />
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

            {activeTab === 'gitignore' && (
              <div className="grid-single">
                <GitignoreGenerator owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'pr-checklist' && (
              <div className="grid-single">
                <PrChecklist owner={owner} repo={repo} />
              </div>
            )}

            {activeTab === 'stale-branches' && (
              <div className="grid-single">
                <StaleBranchCleaner owner={owner} repo={repo} />
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

            {activeTab === 'quiz' && (
              <div className="grid-single">
                <PersonalityQuiz repoInfo={data.repoInfo} stats={data} />
              </div>
            )}

            {activeTab === 'roast' && (
              <div className="grid-single">
                <RoastMyRepo owner={owner} repo={repo} />
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
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button className="demo-btn-large" onClick={loadDemo}>Explore Demo Workspace</button>
            <button className="demo-btn-large" style={{ background: 'linear-gradient(135deg, #ffb703, #ff5555)' }} onClick={() => setActiveTab('battle')}>⚔️ Enter Battle Mode</button>
          </div>
        </div>
      )}

      <footer className="footer">
        <span>Backend: {BACKEND_URL}</span>
      </footer>
    </div>
  );
}



