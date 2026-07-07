const express = require('express');
const { Octokit } = require('@octokit/rest');
const { AnalysisCache } = require('../models');

const router = express.Router();

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

// Caching helpers
async function checkCache(repoUrl, type) {
  try {
    const cached = await AnalysisCache.findOne({ repoUrl: `${repoUrl}-${type}` });
    if (cached) return cached.data;
  } catch (e) {}
  return null;
}

async function setCache(repoUrl, type, data) {
  try {
    await AnalysisCache.updateOne(
      { repoUrl: `${repoUrl}-${type}` },
      { data, cachedAt: new Date() },
      { upsert: true }
    );
  } catch (e) {}
}

// [12] COMMIT STREAK TRACKER
router.get('/streaks/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const cacheKey = 'streaks';

  try {
    const cachedData = await checkCache(repoUrl, cacheKey);
    if (cachedData) return res.json(cachedData);

    let commitData = [];
    let contributors = [];

    if (getMockFallback(owner, repo)) {
      // Mock Commits
      const mockAuthors = ['SarahDev', 'AlexCoder', 'EmmaBuilds'];
      contributors = [
        { login: 'SarahDev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
        { login: 'AlexCoder', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
        { login: 'EmmaBuilds', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' }
      ];

      const baseDate = new Date();
      // SarahDev has 15 days streak, AlexCoder has 8, Emma has 3
      for (let i = 0; i < 30; i++) {
        const dStr = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
        if (i < 15) commitData.push({ author: 'SarahDev', date: dStr });
        if (i < 8) commitData.push({ author: 'AlexCoder', date: dStr });
        if (i < 3) commitData.push({ author: 'EmmaBuilds', date: dStr });
      }
    } else {
      // Live fetch
      const [commitsRes, contribRes] = await Promise.all([
        octokit.repos.listCommits({ owner, repo, per_page: 100 }).catch(() => ({ data: [] })),
        octokit.repos.listContributors({ owner, repo, per_page: 5 }).catch(() => ({ data: [] }))
      ]);

      commitData = commitsRes.data.map(c => ({
        author: c.author ? c.author.login : c.commit.author.name,
        date: c.commit.author.date
      }));

      contributors = contribRes.data.map(c => ({
        login: c.login,
        avatar: c.avatar_url
      }));
    }

    const streakList = contributors.map(contrib => {
      const dates = commitData
        .filter(c => c.author && c.author.toLowerCase() === contrib.login.toLowerCase())
        .map(c => new Date(c.date).toDateString());
      
      const uniqueDates = Array.from(new Set(dates))
        .map(d => new Date(d))
        .sort((a, b) => b - a); // Sort descending (most recent first)

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      if (uniqueDates.length > 0) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const firstCommit = uniqueDates[0];
        firstCommit.setHours(0,0,0,0);

        const diffTime = Math.abs(today - firstCommit);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // If last commit was today or yesterday, start counting current streak
        if (diffDays <= 1) {
          currentStreak = 1;
          tempStreak = 1;
          for (let j = 1; j < uniqueDates.length; j++) {
            const prev = uniqueDates[j - 1];
            const curr = uniqueDates[j];
            const dTime = Math.abs(prev - curr);
            const dDays = Math.round(dTime / (1000 * 60 * 60 * 24));
            
            if (dDays === 1) {
              currentStreak++;
            } else if (dDays > 1) {
              break;
            }
          }
        }

        // Longest Streak
        tempStreak = 1;
        longestStreak = 1;
        for (let j = 1; j < uniqueDates.length; j++) {
          const prev = uniqueDates[j - 1];
          const curr = uniqueDates[j];
          const dTime = Math.abs(prev - curr);
          const dDays = Math.round(dTime / (1000 * 60 * 60 * 24));
          
          if (dDays === 1) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
          } else if (dDays > 1) {
            tempStreak = 1;
          }
        }
      }

      // Badge logic
      let badge = 'Getting Started';
      if (longestStreak >= 30) badge = 'Legend 💎';
      else if (longestStreak >= 14) badge = 'On Fire 🔥';
      else if (longestStreak >= 7) badge = 'Consistent ⭐';

      return {
        login: contrib.login,
        avatar: contrib.avatar,
        longestStreak,
        currentStreak,
        badge,
        commitDates: uniqueDates.map(d => d.toISOString().split('T')[0])
      };
    });

    const result = { contributors: streakList };
    await setCache(repoUrl, cacheKey, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze streaks.' });
  }
});

module.exports = router;
