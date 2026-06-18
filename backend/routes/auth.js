const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_default_secret_key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Check if credentials exist
const hasOAuth = process.env.GITHUB_CLIENT_ID && 
                 process.env.GITHUB_CLIENT_ID !== 'your_github_client_id' &&
                 process.env.GITHUB_CLIENT_SECRET &&
                 process.env.GITHUB_CLIENT_SECRET !== 'your_github_client_secret';

if (hasOAuth) {
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/github/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          user = new User({
            githubId: profile.id,
            login: profile.username,
            avatar: profile._json.avatar_url,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : ''
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
}

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ msg: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ msg: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// Route: Initiate GitHub Login
router.get('/github', (req, res, next) => {
  if (!hasOAuth) {
    // Return mock login if keys are missing
    console.log('Using Mock Auth Fallback...');
    return res.redirect(`${FRONTEND_URL}/?mockToken=true&login=DemoDeveloper&avatar=https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`);
  }
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

// Route: GitHub Callback
router.get('/github/callback', (req, res, next) => {
  if (!hasOAuth) {
    return res.redirect(`${FRONTEND_URL}`);
  }
  passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/?error=auth_failed` }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
    }
    const token = jwt.sign(
      { id: user._id, githubId: user.githubId, login: user.login, avatar: user.avatar },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${FRONTEND_URL}/?token=${token}`);
  })(req, res, next);
});

// Route: Mock Login helper
router.post('/mock-login', async (req, res) => {
  try {
    let user = await User.findOne({ githubId: 'mock-12345' });
    if (!user) {
      user = new User({
        githubId: 'mock-12345',
        login: 'DemoDeveloper',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        email: 'demo@example.com'
      });
      await user.save();
    }
    const token = jwt.sign(
      { id: user._id, githubId: user.githubId, login: user.login, avatar: user.avatar },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, login: user.login, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ msg: 'Mock login failed.' });
  }
});

// Route: Get Saved Repos for Authenticated User
router.get('/repos', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    res.json(user.savedRepos || []);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to retrieve saved repositories.' });
  }
});

// Route: Save Analysis Results
router.post('/repos', authenticateToken, async (req, res) => {
  try {
    const { repoUrl, healthScore } = req.body;
    if (!repoUrl) return res.status(400).json({ msg: 'repoUrl is required.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    // Prevent duplicates: remove if already exists
    user.savedRepos = user.savedRepos.filter(r => r.repoUrl.toLowerCase() !== repoUrl.toLowerCase());
    user.savedRepos.push({ repoUrl, healthScore, timestamp: new Date() });

    await user.save();
    res.json(user.savedRepos);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to save repository analysis.' });
  }
});

module.exports = { router, authenticateToken };
