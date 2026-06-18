const express = require('express');
const Sentiment = require('sentiment');
const { Octokit } = require('@octokit/rest');
const { AnalysisCache } = require('../models');

const router = express.Router();
const sentimentAnalyzer = new Sentiment();

const hasToken = process.env.GITHUB_TOKEN && 
                 process.env.GITHUB_TOKEN !== "you api key goes here" && 
                 process.env.GITHUB_TOKEN !== "api key goes here" && 
                 process.env.GITHUB_TOKEN.trim() !== "";
const octokit = new Octokit({
  auth: hasToken ? process.env.GITHUB_TOKEN : undefined,
});

const getMockFallback = (owner, repo) => {
  return !hasToken || owner === 'demo' || repo === 'demo';
};

// Caching helper
async function checkCache(repoUrl, type) {
  try {
    const cached = await AnalysisCache.findOne({ repoUrl: `${repoUrl}-${type}` });
    if (cached) return cached.data;
  } catch (e) {
    console.error('Cache read error:', e);
  }
  return null;
}

async function setCache(repoUrl, type, data) {
  try {
    await AnalysisCache.updateOne(
      { repoUrl: `${repoUrl}-${type}` },
      { data, cachedAt: new Date() },
      { upsert: true }
    );
  } catch (e) {
    console.error('Cache write error:', e);
  }
}

// [1] COMMIT SENTIMENT ANALYZER
router.get('/sentiment/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const cacheKey = 'sentiment';

  try {
    const cachedData = await checkCache(repoUrl, cacheKey);
    if (cachedData) return res.json(cachedData);

    let commits = [];

    if (getMockFallback(owner, repo)) {
      // Mock Data
      const baseDate = Date.now();
      const mockMoods = [
        'refactor: fix annoying layout bug again',
        'feat: implement beautiful dashboard tabs',
        'docs: update installation instructions',
        'fix: minor styling issue on navbar',
        'chore: release v1.0.3 production build',
        'bug: resolve critical memory leaks in charts',
        'test: add coverages'
      ];
      for (let i = 0; i < 200; i++) {
        const message = mockMoods[i % mockMoods.length] + ` (#${i})`;
        const score = sentimentAnalyzer.analyze(message).score;
        commits.push({
          date: new Date(baseDate - i * 6 * 60 * 60 * 1000).toISOString(),
          score,
          message
        });
      }
    } else {
      // Live fetch last 500 commits (pagination, 5 pages of 100)
      let pageCommits = [];
      for (let page = 1; page <= 5; page++) {
        const resPage = await octokit.repos.listCommits({ owner, repo, per_page: 100, page }).catch(() => ({ data: [] }));
        if (resPage.data.length === 0) break;
        pageCommits = pageCommits.concat(resPage.data);
      }

      commits = pageCommits.map(c => {
        const msg = c.commit.message;
        const score = sentimentAnalyzer.analyze(msg).score;
        return {
          date: c.commit.author.date,
          score,
          message: msg
        };
      });
    }

    commits.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get top positive/negative
    const sortedByScore = [...commits].sort((a, b) => b.score - a.score);
    const positive = sortedByScore.slice(0, 3).filter(c => c.score > 0);
    const negative = [...sortedByScore].reverse().slice(0, 3).filter(c => c.score < 0);

    const result = { commits, topPositive: positive, topNegative: negative };
    await setCache(repoUrl, cacheKey, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze commit sentiment.' });
  }
});

// [2] CODE CHURN HEATMAP
router.get('/churn/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const cacheKey = 'churn';

  try {
    const cachedData = await checkCache(repoUrl, cacheKey);
    if (cachedData) return res.json(cachedData);

    let fileChurn = [];

    if (getMockFallback(owner, repo)) {
      // Mock Churn
      const files = [
        'src/components/CommitGraph.tsx', 'src/hooks/useGitData.ts', 'server.js', 'package.json',
        'src/components/Dashboard.tsx', 'src/App.jsx', 'src/App.css', 'src/FileTree.jsx'
      ];
      fileChurn = files.map(f => ({
        filename: f.split('/').pop(),
        churnScore: Math.floor(Math.random() * 800) + 100,
        path: f
      }));
    } else {
      // Fetch last 50 commits and gather additions/deletions per file
      const commitsRes = await octokit.repos.listCommits({ owner, repo, per_page: 30 }).catch(() => ({ data: [] }));
      const churnMap = {};

      const detailPromises = commitsRes.data.map(c => 
        octokit.repos.getCommit({ owner, repo, ref: c.sha }).catch(() => null)
      );
      const details = await Promise.all(detailPromises);

      details.forEach(detail => {
        if (!detail || !detail.data || !detail.data.files) return;
        detail.data.files.forEach(file => {
          const path = file.filename;
          const name = path.split('/').pop();
          const additions = file.additions || 0;
          const deletions = file.deletions || 0;
          const total = additions + deletions;

          if (!churnMap[path]) {
            churnMap[path] = { filename: name, churnScore: 0, path };
          }
          churnMap[path].churnScore += total;
        });
      });

      fileChurn = Object.values(churnMap);
    }

    fileChurn.sort((a, b) => b.churnScore - a.churnScore);

    await setCache(repoUrl, cacheKey, fileChurn);
    res.json(fileChurn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze code churn.' });
  }
});

// [3] RELEASE VELOCITY TRACKER
router.get('/releases/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const cacheKey = 'releases';

  try {
    const cachedData = await checkCache(repoUrl, cacheKey);
    if (cachedData) return res.json(cachedData);

    let releaseData = [];

    if (getMockFallback(owner, repo)) {
      // Mock Releases
      const baseDate = Date.now();
      releaseData = [
        { name: 'v1.4.0', date: new Date(baseDate).toISOString() },
        { name: 'v1.3.0', date: new Date(baseDate - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'v1.2.0', date: new Date(baseDate - 22 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'v1.1.0', date: new Date(baseDate - 40 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'v1.0.0', date: new Date(baseDate - 65 * 24 * 60 * 60 * 1000).toISOString() },
      ];
    } else {
      // Live Fetch
      const tagsRes = await octokit.repos.listTags({ owner, repo, per_page: 30 }).catch(() => ({ data: [] }));
      const tagDetails = await Promise.all(tagsRes.data.map(async tag => {
        const commitRes = await octokit.git.getCommit({ owner, repo, commit_sha: tag.commit.sha }).catch(() => null);
        return {
          name: tag.name,
          date: commitRes ? commitRes.data.author.date : null
        };
      }));
      releaseData = tagDetails.filter(t => t.date);
    }

    // Sort by date ascending to compute difference
    releaseData.sort((a, b) => new Date(a.date) - new Date(b.date));

    const releases = [];
    let totalDays = 0;

    for (let i = 0; i < releaseData.length; i++) {
      let daysSincePrev = 0;
      if (i > 0) {
        const prev = new Date(releaseData[i - 1].date);
        const curr = new Date(releaseData[i].date);
        daysSincePrev = Math.max(1, Math.round((curr - prev) / (1000 * 60 * 60 * 24)));
        totalDays += daysSincePrev;
      }
      releases.push({
        tag: releaseData[i].name,
        date: releaseData[i].date,
        daysSincePrev
      });
    }

    const avgVelocity = releases.length > 1 ? Math.round(totalDays / (releases.length - 1)) : 10;

    const result = { releases, avgVelocity };
    await setCache(repoUrl, cacheKey, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track release velocity.' });
  }
});

// [4] NIGHT OWL / EARLY BIRD STATS
router.get('/activity-patterns/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const cacheKey = 'activity-patterns';

  try {
    const cachedData = await checkCache(repoUrl, cacheKey);
    if (cachedData) return res.json(cachedData);

    let commitData = [];

    if (getMockFallback(owner, repo)) {
      // Mock Commits
      const mockAuthors = ['SarahDev', 'AlexCoder', 'EmmaBuilds'];
      const baseDate = Date.now();
      for (let i = 0; i < 200; i++) {
        // Random hours: SarahDev Owl, AlexCoder Early, Emma 9to5
        let hr = 12;
        const auth = mockAuthors[i % mockAuthors.length];
        if (auth === 'SarahDev') {
          hr = [23, 0, 1, 2, 22, 14][Math.floor(Math.random() * 6)];
        } else if (auth === 'AlexCoder') {
          hr = [6, 7, 8, 5, 9, 13][Math.floor(Math.random() * 6)];
        } else {
          hr = [9, 10, 11, 13, 14, 15, 16, 17][Math.floor(Math.random() * 8)];
        }
        const d = new Date(baseDate);
        d.setHours(hr);
        commitData.push({
          author: auth,
          date: d.toISOString()
        });
      }
    } else {
      // Fetch commits
      const commitsRes = await octokit.repos.listCommits({ owner, repo, per_page: 100 }).catch(() => ({ data: [] }));
      commitData = commitsRes.data.map(c => ({
        author: c.author ? c.author.login : c.commit.author.name,
        date: c.commit.author.date
      }));
    }

    // Aggregate hours per contributor
    const contribHours = {};
    commitData.forEach(c => {
      const auth = c.author;
      if (!auth) return;
      const hr = new Date(c.date).getHours();

      if (!contribHours[auth]) {
        contribHours[auth] = Array(24).fill(0);
      }
      contribHours[auth][hr]++;
    });

    const contributorsList = Object.entries(contribHours).map(([login, hourDistribution]) => {
      let maxCount = -1;
      let peakHour = 12;
      hourDistribution.forEach((cnt, h) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          peakHour = h;
        }
      });

      // Label assignment
      let label = '9-to-5';
      if (peakHour >= 22 || peakHour <= 4) {
        label = 'Night Owl';
      } else if (peakHour >= 5 && peakHour <= 9) {
        label = 'Early Bird';
      }

      return {
        login,
        hourDistribution,
        peakHour,
        label
      };
    });

    contributorsList.sort((a, b) => b.hourDistribution.reduce((acc, c) => acc + c, 0) - a.hourDistribution.reduce((acc, c) => acc + c, 0));

    const result = { contributors: contributorsList.slice(0, 5) };
    await setCache(repoUrl, cacheKey, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze activity patterns.' });
  }
});

module.exports = router;
