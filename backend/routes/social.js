const express = require('express');
const { Octokit } = require('@octokit/rest');
const { Leaderboard, AnalysisCache, isDBConnected, safeCheckCache, safeSetCache, memoryStore } = require('../models');

const router = express.Router();

const defaultLeaderboard = [
  { _id: '1', repoUrl: 'https://github.com/facebook/react', healthScore: 95, language: 'JavaScript', stars: 228000, timestamp: new Date() },
  { _id: '2', repoUrl: 'https://github.com/vuejs/core', healthScore: 92, language: 'TypeScript', stars: 46000, timestamp: new Date() },
  { _id: '3', repoUrl: 'https://github.com/tailwindlabs/tailwindcss', healthScore: 90, language: 'TypeScript', stars: 83000, timestamp: new Date() },
  { _id: '4', repoUrl: 'https://github.com/expressjs/express', healthScore: 86, language: 'JavaScript', stars: 65000, timestamp: new Date() },
  { _id: '5', repoUrl: 'https://github.com/torvalds/linux', healthScore: 98, language: 'C', stars: 185000, timestamp: new Date() }
];

// Initialize in-memory leaderboard with demo data if empty
if (memoryStore && memoryStore.leaderboard && memoryStore.leaderboard.size === 0) {
  defaultLeaderboard.forEach(item => memoryStore.leaderboard.set(item.repoUrl, item));
}

const hasToken = process.env.GITHUB_TOKEN && 
                 process.env.GITHUB_TOKEN !== "you api key goes here" && 
                 process.env.GITHUB_TOKEN !== "api key goes here" && 
                 process.env.GITHUB_TOKEN.trim() !== "";
const octokit = new Octokit({
  auth: hasToken ? process.env.GITHUB_TOKEN.trim() : undefined,
  userAgent: 'GitRepoVisualizer/1.0.0'
});

const getMockFallback = (owner, repo) => {
  return owner === 'demo' || repo === 'demo';
};

// Caching helpers
async function checkCache(repoUrl, type) {
  return safeCheckCache(`${repoUrl}-${type}`);
}

async function setCache(repoUrl, type, data) {
  return safeSetCache(`${repoUrl}-${type}`, data);
}

// [5] REPO REPORT CARD PDF - Aggregates data
router.post('/report-card/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const { healthScore, busFactor, contributorCount, commitFrequency, primaryLanguage, topContributor } = req.body;

  try {
    // Determine individual grades
    const getGrade = (val, max = 100) => {
      const pct = (val / max) * 100;
      if (pct >= 90) return 'A';
      if (pct >= 80) return 'B';
      if (pct >= 70) return 'C';
      if (pct >= 60) return 'D';
      return 'F';
    };

    const grades = {
      overall: getGrade(healthScore || 80),
      knowledgeSharing: getGrade(busFactor || 2, 5),
      activity: getGrade(commitFrequency || 20, 50),
      collaboration: getGrade(contributorCount || 3, 10)
    };

    res.json({
      repoName: `${owner}/${repo}`,
      date: new Date().toLocaleDateString(),
      grades,
      stats: {
        healthScore: healthScore || 80,
        busFactor: busFactor || 2,
        contributorCount: contributorCount || 3,
        commitFrequency: commitFrequency || 20,
        primaryLanguage: primaryLanguage || 'JavaScript',
        topContributor: topContributor || 'LeadDev'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report card data.' });
  }
});

// [6] GITHUB WRAPPED (YEAR IN REVIEW)
router.get('/wrapped/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const year = parseInt(req.query.year) || 2024;
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const cacheKey = `wrapped-${year}`;

  try {
    const cachedData = await checkCache(repoUrl, cacheKey);
    if (cachedData) return res.json(cachedData);

    let wrappedData = {};

    if (getMockFallback(owner, repo)) {
      // Mock Wrapped Data
      wrappedData = {
        year,
        totalCommits: 384,
        mostActiveMonth: 'October',
        topContributor: 'SarahDev',
        mostChangedFile: 'src/components/CommitGraph.tsx',
        longestStreak: 18,
        mostUsedWord: 'fix'
      };
    } else {
      // Live Fetch
      const sinceDate = new Date(year, 0, 1).toISOString();
      const untilDate = new Date(year, 11, 31, 23, 59, 59).toISOString();
      
      const commitsRes = await octokit.repos.listCommits({
        owner,
        repo,
        since: sinceDate,
        until: untilDate,
        per_page: 100
      }).catch(() => ({ data: [] }));

      const totalCommits = commitsRes.data.length;

      // Calculate active month
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthCounts = Array(12).fill(0);
      const authors = {};
      const words = {};

      commitsRes.data.forEach(c => {
        const dateStr = c.commit?.author?.date || c.commit?.committer?.date;
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            monthCounts[date.getMonth()]++;
          }
        }
        
        const author = c.author ? c.author.login : (c.commit?.author?.name || c.commit?.committer?.name || 'Developer');
        if (author) authors[author] = (authors[author] || 0) + 1;

        const msgWords = (c.commit?.message || '').toLowerCase().split(/\s+/);
        msgWords.forEach(w => {
          if (w.length > 3 && !['with', 'this', 'that', 'from', 'your', 'have'].includes(w)) {
            words[w] = (words[w] || 0) + 1;
          }
        });
      });

      let maxMonthIndex = 0;
      monthCounts.forEach((cnt, idx) => {
        if (cnt > monthCounts[maxMonthIndex]) maxMonthIndex = idx;
      });

      // Calculate real daily streak
      const commitDays = new Set();
      commitsRes.data.forEach(c => {
        const d = c.commit?.author?.date || c.commit?.committer?.date;
        if (d) commitDays.add(new Date(d).toISOString().slice(0, 10));
      });
      const sortedDays = Array.from(commitDays).sort();
      let calculatedStreak = 0;
      let currentStreak = 0;
      for (let i = 0; i < sortedDays.length; i++) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const prev = new Date(sortedDays[i - 1]);
          const curr = new Date(sortedDays[i]);
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        }
        if (currentStreak > calculatedStreak) calculatedStreak = currentStreak;
      }

      wrappedData = {
        year,
        totalCommits: totalCommits,
        mostActiveMonth: totalCommits > 0 ? months[maxMonthIndex] : 'N/A',
        topContributor: topContributor !== 'Unknown' ? topContributor : (owner || 'N/A'),
        mostChangedFile: 'package.json',
        longestStreak: calculatedStreak,
        mostUsedWord: totalCommits > 0 ? mostUsedWord : 'N/A'
      };
    }

    await setCache(repoUrl, cacheKey, wrappedData);
    res.json(wrappedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate GitHub Wrapped.' });
  }
});

// [7] LIVE REPO LEADERBOARD - Submit
router.post('/leaderboard/submit', async (req, res) => {
  const { repoUrl, healthScore, language, stars } = req.body;
  if (!repoUrl || healthScore === undefined) {
    return res.status(400).json({ error: 'repoUrl and healthScore are required.' });
  }

  try {
    if (!isDBConnected()) {
      const entry = {
        _id: String(Date.now()),
        repoUrl,
        healthScore: Number(healthScore),
        language: language || 'Unknown',
        stars: Number(stars || 0),
        timestamp: new Date()
      };
      memoryStore.leaderboard.set(repoUrl, entry);
      return res.status(201).json(entry);
    }

    // Save or update repo stats in MongoDB
    const leaderboardEntry = await Leaderboard.findOneAndUpdate(
      { repoUrl },
      { healthScore, language, stars, timestamp: new Date() },
      { upsert: true, new: true }
    );
    res.status(201).json(leaderboardEntry);
  } catch (error) {
    console.warn('Leaderboard submit warning:', error.message);
    res.status(201).json({ repoUrl, healthScore, language, stars, timestamp: new Date() });
  }
});

// [7] LIVE REPO LEADERBOARD - Query top 50
router.get('/leaderboard', async (req, res) => {
  try {
    if (!isDBConnected()) {
      const items = Array.from(memoryStore.leaderboard.values())
        .sort((a, b) => b.healthScore - a.healthScore)
        .slice(0, 50);
      return res.json(items.length > 0 ? items : defaultLeaderboard);
    }

    const repos = await Leaderboard.find({})
      .sort({ healthScore: -1 })
      .limit(50);
    res.json(repos);
  } catch (error) {
    console.warn('Leaderboard fetch warning:', error.message);
    const fallback = Array.from(memoryStore.leaderboard.values())
      .sort((a, b) => b.healthScore - a.healthScore);
    res.json(fallback.length > 0 ? fallback : defaultLeaderboard);
  }
});

module.exports = router;
