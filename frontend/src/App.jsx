import React, { useState } from 'react';
import axios from 'axios';
import LanguageChart from './component/LanguageChart.jsx';
import DependencyList from './component/DependencyList.jsx';
import ContributorList from './component/ContributorList.jsx';
import CommitActivityChart from './component/CommitActivityChart.jsx';
import FileTree from './FileTree.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    repoInfo: null,
    languages: {},
    dependencies: {},
    commitHistory: [],
    contributors: [],
    commitActivity: [],
    fileTree: [],
  });

  async function analyzeRepo(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/analyze-repo`, { repoUrl });
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Git Repo Visualizer</h1>
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
            <span>{data.repoInfo.owner}/{data.repoInfo.repo}</span>
            <span>Default branch: {data.repoInfo.defaultBranch}</span>
          </div>
        )}
      </header>

      <main className="grid">
        <section className="card">
          <h2>Language Distribution</h2>
          <LanguageChart languages={data.languages} />
        </section>

        <section className="card">
          <h2>Top Contributors</h2>
          <ContributorList contributors={data.contributors} />
        </section>

        <section className="card">
          <h2>Recent Commit Activity</h2>
          <CommitActivityChart activity={data.commitActivity} />
        </section>

        <section className="card">
          <h2>Dependencies</h2>
          <DependencyList dependencies={data.dependencies} />
        </section>

        <section className="card wide">
          <h2>File Tree</h2>
          <FileTree files={data.fileTree} />
        </section>
      </main>

      <footer className="footer">
        <span>Backend: {BACKEND_URL}</span>
      </footer>
    </div>
  );
}


