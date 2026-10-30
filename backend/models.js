const mongoose = require('mongoose');

// Disable buffering so queries fail immediately or fall back if MongoDB is not connected
mongoose.set('bufferCommands', false);

// In-Memory Fallback Store (for demo / development without MongoDB)
const memoryStore = {
  leaderboard: new Map(),
  cache: new Map(),
  users: new Map(),
  subscriptions: []
};

// Check if MongoDB is connected
const isDBConnected = () => mongoose.connection.readyState === 1;

// Connect to MongoDB helper function
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('Notice: MONGODB_URI is not set. Running in stateless / in-memory demo mode.');
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.warn('MongoDB connection warning:', error.message, '(Running in demo fallback mode)');
  }
};

const { encrypt, decrypt, hashBlindIndex } = require('./security/crypto');

// 1. Leaderboard Schema
const LeaderboardSchema = new mongoose.Schema({
  repoUrl: { type: String, required: true, unique: true },
  healthScore: { type: Number, required: true },
  language: { type: String, default: 'Unknown' },
  stars: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  timestamp: { type: Date, default: Date.now }
});

// 2. Subscription Schema with Encrypted Email at Rest
const SubscriptionSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    set: (val) => encrypt(val),
    get: (val) => decrypt(val)
  },
  emailHash: { type: String, index: true },
  repoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});
SubscriptionSchema.index({ emailHash: 1, repoUrl: 1 }, { unique: true });

// 3. AnalysisCache Schema (15 min TTL)
const AnalysisCacheSchema = new mongoose.Schema({
  repoUrl: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  cachedAt: { type: Date, default: Date.now, index: { expires: 900 } }
});

// 4. User Schema with Encrypted Email & Access Token at Rest
const UserSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  login: { type: String, required: true },
  avatar: { type: String },
  email: { 
    type: String,
    set: (val) => val ? encrypt(val) : val,
    get: (val) => val ? decrypt(val) : val
  },
  accessToken: {
    type: String,
    set: (val) => val ? encrypt(val) : val,
    get: (val) => val ? decrypt(val) : val
  },
  savedRepos: [
    {
      repoUrl: { type: String, required: true },
      healthScore: { type: Number },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// 5. AiInsightsCache Schema (24 hours TTL)
const AiInsightsCacheSchema = new mongoose.Schema({
  repoUrl: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  cachedAt: { type: Date, default: Date.now, index: { expires: 86400 } }
});

const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
const AnalysisCache = mongoose.model('AnalysisCache', AnalysisCacheSchema);
const User = mongoose.model('User', UserSchema);
const AiInsightsCache = mongoose.model('AiInsightsCache', AiInsightsCacheSchema);

// Safe caching helpers that use in-memory store if DB is disconnected
async function safeCheckCache(key) {
  if (!isDBConnected()) {
    const item = memoryStore.cache.get(key);
    if (item && Date.now() - item.time < 900000) return item.data;
    return null;
  }
  try {
    const cached = await AnalysisCache.findOne({ repoUrl: key });
    if (cached) return cached.data;
  } catch (e) {}
  return null;
}

async function safeSetCache(key, data) {
  if (!isDBConnected()) {
    memoryStore.cache.set(key, { data, time: Date.now() });
    return;
  }
  try {
    await AnalysisCache.updateOne(
      { repoUrl: key },
      { data, cachedAt: new Date() },
      { upsert: true }
    );
  } catch (e) {}
}

module.exports = {
  connectDB,
  isDBConnected,
  memoryStore,
  safeCheckCache,
  safeSetCache,
  Leaderboard,
  Subscription,
  AnalysisCache,
  User,
  AiInsightsCache,
  encrypt,
  decrypt,
  hashBlindIndex
};
