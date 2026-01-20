const express = require('express');
const cors = require('cors');
require('dotenv').config(); // This line MUST be high up to load your .env file
const { Octokit } = require('@octokit/rest');

// --- 2. Initialize Express App & Octokit ---
const app = express();
const PORT = process.env.PORT || 5001;

// This initializes the GitHub client with your secret token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// --- 3. Apply Middleware ---
// These functions run on every request
app.use(cors());       // Allows your frontend to make requests
app.use(express.json()); // Allows the server to read JSON from request bodies

// --- 4. Define The Main API Endpoint ---
// This is the only route our server needs.
// It's 'async' because we must 'await' responses from the GitHub API.
app.post('/api/analyze-repo', async (req, res) => {
  console.log('Received a new request to analyze a repository...');
  
  try {
    // --- Step A: Get and Validate the URL ---
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ msg: 'Repository URL is required.' });
    }

    // This splits the URL to get the owner and repo name
    const urlParts = repoUrl.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1];

    if (!owner || !repo) {
      return res.status(400).json({ msg: 'Invalid GitHub repository URL format.' });
    }
    
    console.log(`Analyzing: ${owner}/${repo}`);

    // --- Step B: Get the Default Branch Name ---
    // This is important because it could be 'main', 'master', or something else.
    const repoDetails = await octokit.repos.get({ owner, repo });
    const defaultBranch = repoDetails.data.default_branch;
    console.log(`Found default branch: ${defaultBranch}`);

    // --- Step C: Fetch All Core Data in Parallel ---
    // Promise.all is very fast! It runs all these requests at the same time.
    const [languageResponse, treeResponse, commitResponse, contributorResponse] = await Promise.all([
      octokit.repos.listLanguages({ owner, repo }),
      octokit.git.getTree({ owner, repo, tree_sha: defaultBranch, recursive: 'true' }),
      octokit.repos.listCommits({ owner, repo, per_page: 50 }), // Get the 50 most recent commits
      octokit.repos.listContributors({ owner, repo }), // NEW: Get contributors
    ]);

    // --- Step D: Process Core Data ---
    const languages = languageResponse.data;
    const fileTree = treeResponse.data.tree; // This is a "flat" tree for now
    
    // Clean up the commit history data
    const commitHistory = commitResponse.data.map(c => ({
      sha: c.sha.substring(0, 7),
      author: c.commit.author.name,
      date: c.commit.author.date,
      message: c.commit.message,
    }));
    console.log('Successfully fetched languages, file tree, and commits.');

    // --- Step D.2: Process Contributor Data ---
    const contributors = contributorResponse.data
      .map(c => ({
        login: c.login,
        avatar_url: c.avatar_url,
        contributions: c.contributions,
      }))
      .slice(0, 10); // Get just the top 10 contributors
    console.log('Successfully processed contributor data.');

    // --- Step D.3: Process Commit Activity for Chart ---
    // This counts how many commits happened on each day
    const commitActivityMap = new Map();
    commitHistory.forEach(commit => {
      const commitDate = new Date(commit.date).toLocaleDateString();
      const count = commitActivityMap.get(commitDate) || 0;
      commitActivityMap.set(commitDate, count + 1);
    });
    // Convert the map to an array of objects that Chart.js can use
    const commitActivity = Array.from(commitActivityMap.entries())
      .map(([date, commits]) => ({ date, commits }))
      .reverse(); // Show most recent dates first
    console.log('Successfully processed commit activity.');


    // --- Step E: Analyze Dependencies (e.g., package.json) ---
    // We wrap this in its own 'try...catch' so the app doesn't crash
    // if a 'package.json' file is not found.
    let dependencies = {};
    try {
      const { data: packageJsonContent } = await octokit.repos.getContent({
        owner,
        repo,
        path: 'package.json',
      });
      
      // Content from GitHub is Base64 encoded. We must decode it.
      const decodedContent = Buffer.from(packageJsonContent.content, 'base64').toString('utf8');
      const packageJson = JSON.parse(decodedContent);
      
      // Combine both dependencies and devDependencies into one object
      dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      console.log('Found and parsed package.json!');
      
    } catch (error) {
      if (error.status === 404) {
        // This is not a real "error", it just means the file isn't there.
        console.log('No package.json found in this repository. Skipping dependency analysis.');
      } else {
        // Log other errors but don't crash the server
        console.warn('Error processing package.json:', error.message);
      }
    }

    // --- Step F: Send the Final Successful Response ---
    // We package everything into one clean JSON object for the frontend.
    console.log('Analysis complete! Sending data to frontend.');
    res.json({
      repoInfo: { owner, repo, defaultBranch },
      languages,
      fileTree,
      commitHistory, 
      dependencies,
      contributors,     // NEW: Add contributors to the response
      commitActivity,   // NEW: Add commit activity to the response
    });

  } catch (error) {
    // --- Step G: Handle All Errors ---
    // If any of the 'await' calls in the 'try' block fail, the code jumps here.
    console.error('!!! A critical error occurred:', error.message);
    
    if (error.status === 404) {
      // 404 means 'Not Found'
      return res.status(404).json({ msg: 'Repository not found. Check the URL or if the repository is public.' });
    }
    // For any other error (e.g., API limit, server issue), send a 500 status.
    res.status(500).json({ msg: 'An internal server error occurred while analyzing the repository.' });
  }
});

// --- 5. Start the Server ---
// This tells our app to start listening for requests on our port.
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});