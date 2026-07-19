const mongoose = require('mongoose');

// Connect to MongoDB helper function
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/git-analyzer';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

// 1. Leaderboard Schema
const LeaderboardSchema = new mongoose.Schema({
  repoUrl: { type: String, required: true, unique: true },
  healthScore: { type: Number, required: true },
  language: { type: String, default: 'Unknown' },
  stars: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  timestamp: { type: Date, default: Date.now }
});

// 2. Subscription Schema
const SubscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  repoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
// Ensure unique combination of email and repoUrl
SubscriptionSchema.index({ email: 1, repoUrl: 1 }, { unique: true });

// 3. AnalysisCache Schema (15 min TTL)
const AnalysisCacheSchema = new mongoose.Schema({
  repoUrl: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  cachedAt: { type: Date, default: Date.now, index: { expires: 900 } } // 900 seconds = 15 minutes
});

// 4. User Schema (Saved Repos)
const UserSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  login: { type: String, required: true },
  avatar: { type: String },
  email: { type: String },
  savedRepos: [
    {
      repoUrl: { type: String, required: true },
      healthScore: { type: Number },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
const AnalysisCache = mongoose.model('AnalysisCache', AnalysisCacheSchema);
const User = mongoose.model('User', UserSchema);

// 5. AiInsightsCache Schema (24 hours TTL)
const AiInsightsCacheSchema = new mongoose.Schema({
  repoUrl: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  cachedAt: { type: Date, default: Date.now, index: { expires: 86400 } } // 86400 seconds = 24 hours
});

const AiInsightsCache = mongoose.model('AiInsightsCache', AiInsightsCacheSchema);

module.exports = {
  connectDB,
  Leaderboard,
  Subscription,
  AnalysisCache,
  User,
  AiInsightsCache
};
