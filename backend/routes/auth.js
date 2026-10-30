const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const { User, isDBConnected, memoryStore } = require('../models');

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
        if (!isDBConnected()) {
          const user = {
            _id: profile.id,
            githubId: profile.id,
            login: profile.username,
            avatar: profile._json?.avatar_url,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
            savedRepos: []
          };
          memoryStore.users.set(profile.id, user);
          return done(null, user);
        }

        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          user = new User({
            githubId: profile.id,
            login: profile.username,
            avatar: profile._json.avatar_url,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
            accessToken: accessToken
          });
          await user.save();
        } else {
          user.accessToken = accessToken;
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
}

// Middleware to authenticate JWT with strict verification
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
    return res.redirect(`${FRONTEND_URL}/#mockToken=true&login=DemoDeveloper&avatar=https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`);
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
    // Use URL hash fragment to prevent tokens leaking to server logs, proxy logs, or Referer headers
    res.redirect(`${FRONTEND_URL}/#token=${token}`);
  })(req, res, next);
});

// Route: Mock Login helper
router.post('/mock-login', async (req, res) => {
  try {
    if (!isDBConnected()) {
      const mockUser = {
        _id: 'mock-12345',
        githubId: 'mock-12345',
        login: 'DemoDeveloper',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        email: 'demo@example.com',
        savedRepos: [
          { repoUrl: 'https://github.com/facebook/react', healthScore: 95, timestamp: new Date() }
        ]
      };
      memoryStore.users.set('mock-12345', mockUser);
      const token = jwt.sign(
        { id: mockUser._id, githubId: mockUser.githubId, login: mockUser.login, avatar: mockUser.avatar },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ token, login: mockUser.login, avatar: mockUser.avatar });
    }

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
    console.warn('Mock login fallback error:', err.message);
    const token = jwt.sign(
      { id: 'mock-12345', githubId: 'mock-12345', login: 'DemoDeveloper', avatar: '' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, login: 'DemoDeveloper', avatar: '' });
  }
});

// Route: Get Saved Repos for Authenticated User
router.get('/repos', authenticateToken, async (req, res) => {
  try {
    if (!isDBConnected()) {
      const user = memoryStore.users.get(req.user.id) || { savedRepos: [] };
      return res.json(user.savedRepos || []);
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    res.json(user.savedRepos || []);
  } catch (err) {
    const user = memoryStore.users.get(req.user.id) || { savedRepos: [] };
    res.json(user.savedRepos || []);
  }
});

// Route: Save Analysis Results
router.post('/repos', authenticateToken, async (req, res) => {
  try {
    const { repoUrl, healthScore } = req.body;
    if (!repoUrl) return res.status(400).json({ msg: 'repoUrl is required.' });

    if (!isDBConnected()) {
      let user = memoryStore.users.get(req.user.id);
      if (!user) {
        user = { _id: req.user.id, login: req.user.login || 'User', savedRepos: [] };
        memoryStore.users.set(req.user.id, user);
      }
      user.savedRepos = (user.savedRepos || []).filter(r => r.repoUrl.toLowerCase() !== repoUrl.toLowerCase());
      user.savedRepos.push({ repoUrl, healthScore: Number(healthScore || 80), timestamp: new Date() });
      return res.json(user.savedRepos);
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    // Prevent duplicates: remove if already exists
    user.savedRepos = user.savedRepos.filter(r => r.repoUrl.toLowerCase() !== repoUrl.toLowerCase());
    user.savedRepos.push({ repoUrl, healthScore, timestamp: new Date() });

    await user.save();
    res.json(user.savedRepos);
  } catch (err) {
    console.warn('Save repo warning:', err.message);
    res.json([{ repoUrl: req.body.repoUrl, healthScore: req.body.healthScore || 80, timestamp: new Date() }]);
  }
});

module.exports = { router, authenticateToken };
