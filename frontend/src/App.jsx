import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  GitBranch, GitPullRequest, ShieldAlert, Cpu, BarChart2, 
  GitCompare, Settings, PlayCircle, Layers, Users, FileText, Download,
  Award, Flame
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

// Import New Components
import HealthScore from './component/HealthScore.jsx';
import DeveloperPersonas from './component/DeveloperPersonas.jsx';
import BattleMode from './component/BattleMode.jsx';
import BusFactor from './component/BusFactor.jsx';
import OnboardingGuide from './component/OnboardingGuide.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
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

  async function analyzeRepo(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/analyze-repo`, { repoUrl });
      setData(res.data);
      setTimelineCommits(res.data.commitHistory || []);
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
    if (tab && ['overview', 'health', 'battle', 'commits', 'playback', 'compare', 'prs', 'contributors', 'quality', 'dependencies', 'onboarding', 'ai'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Layers size={16} /> },
    { id: 'health', name: 'Health Score', icon: <Award size={16} /> },
    { id: 'battle', name: 'Battle Mode', icon: <Flame size={16} /> },
    { id: 'commits', name: 'Commit Graph', icon: <GitBranch size={16} /> },
    { id: 'playback', name: 'Timeline Playback', icon: <PlayCircle size={16} /> },
    { id: 'compare', name: 'Branch Compare', icon: <GitCompare size={16} /> },
    { id: 'prs', name: 'PRs & Issues', icon: <GitPullRequest size={16} /> },
    { id: 'contributors', name: 'Collaboration', icon: <Users size={16} /> },
    { id: 'quality', name: 'Code Quality', icon: <BarChart2 size={16} /> },
    { id: 'dependencies', name: 'Dependencies', icon: <Settings size={16} /> },
    { id: 'onboarding', name: 'Onboarding Guide', icon: <FileText size={16} /> },
    { id: 'ai', name: 'AI Insights', icon: <Cpu size={16} /> },
  ];

  return (
    <div className="app">
      <header className="header glass-panel">
        <div className="title-row">
          <h1>Git Repository Visualizer</h1>
          <button className="demo-btn" onClick={loadDemo}>Load Demo Data</button>
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

      {(data.repoInfo || activeTab === 'battle') && (
        <div className="dashboard-container">
          <aside className="sidebar glass-panel">
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
          </main>
        </div>
      )}

      {!data.repoInfo && activeTab !== 'battle' && (
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



