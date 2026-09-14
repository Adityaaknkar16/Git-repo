# Deployment & Secrets Configuration Guide

This guide outlines how to deploy the **Git Repository Visualizer** project smoothly and securely.

- **Backend (Node.js API)** &rarr; Deployed on **Render** (or Railway / Fly.io)
- **Frontend (React / Vite SPA)** &rarr; Deployed on **Vercel**

---

## 1. Backend Deployment on Render

Render hosts the Express API server located in the `backend/` directory.

### Step-by-Step Setup:
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your Git repository.
3. Configure the following fields:
   - **Name**: `git-repo-visualizer-api` (or your choice)
   - **Region**: Closest to your users (e.g. `Frankfurt`, `Oregon`, `Singapore`)
   - **Branch**: `main` (or your production branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health` (or `/`)
4. Expand the **Environment Variables** section and add the required configuration keys.

### Environment Variables on Render:

| Key | Required | Value / Description | Placeholder Example |
| :--- | :---: | :--- | :--- |
| `PORT` | Auto | Port assigned by Render or fallback | `5001` |
| `NODE_ENV` | Optional | Environment mode | `production` |
| `GITHUB_TOKEN` | Optional | GitHub Personal Access Token (for live queries). Leave blank to use Demo Mode. | `<YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>` |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI Code Analyzer | `<YOUR_GEMINI_API_KEY>` |
| `JWT_SECRET` | Recommended | Secure random string for JWT token signing | `<YOUR_JWT_SECRET_STRING>` |
| `SESSION_SECRET` | Recommended | Secure random string for session encryption | `<YOUR_SESSION_SECRET_STRING>` |
| `FRONTEND_URL` | Recommended | The production URL of your Vercel frontend | `https://<YOUR_APP_NAME>.vercel.app` |
| `BACKEND_URL` | Optional | The URL of this Render web service (for OAuth redirects) | `https://<YOUR_API_NAME>.onrender.com` |
| `MONGODB_URI` | Optional | MongoDB connection string (leave blank for stateless demo mode) | `mongodb+srv://<USER>:<PASSWORD>@cluster.mongodb.net/<DB_NAME>` |

> [!TIP]
> **Render Free Tier Note**: Free Render instances sleep after 15 minutes of inactivity. When a request arrives, it may take 30-50 seconds to wake up (cold start). The frontend handles loading spinners gracefully while waiting for the response.

---

## 2. Frontend Deployment on Vercel

Vercel hosts the high-performance Vite React SPA located in the `frontend/` directory.

### Step-by-Step Setup:
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Select and import your GitHub repository.
3. In the project setup wizard:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**.
   - **Build and Output Settings**: Defaults (`Build Command: npm run build`, `Output Directory: dist`).
   - **Install Command**: `npm install`
4. Expand **Environment Variables** and add:

| Key | Value / Description | Placeholder Example |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | The public HTTPS URL of your Render backend | `https://<YOUR_API_NAME>.onrender.com` |

5. Click **Deploy**. Vercel will build the SPA and deploy it with global CDN caching.

---

## 3. Security & Secrets Protection

All environment variables and credentials are kept strictly out of git version control:
- Local `.env` files are ignored in [.gitignore](file:///e:/projectss/Git%20repo%20visualizer/.gitignore), [backend/.gitignore](file:///e:/projectss/Git%20repo%20visualizer/backend/.gitignore), and [frontend/.gitignore](file:///e:/projectss/Git%20repo%20visualizer/frontend/.gitignore).
- Template variable examples are documented in [backend/.env.example](file:///e:/projectss/Git%20repo%20visualizer/backend/.env.example) and [frontend/.env.example](file:///e:/projectss/Git%20repo%20visualizer/frontend/.env.example).
- Secrets should only ever be set in the platform environment variable dashboards (Render Dashboard / Vercel Dashboard).

### What if a token was previously committed or exposed?
If a token was ever exposed:
1. Go to GitHub -> **Settings** -> **Developer Settings** -> **Personal Access Tokens**.
2. Click on the token and select **Revoke** / **Delete**.
3. Generate a new token with appropriate scopes (`repo`, `read:user`) and paste it directly into Render's Environment Variables settings.

---

## 4. Health Checks & Verification

- **Backend Health Check**: Open `https://<YOUR_API_NAME>.onrender.com/health` in your browser. It should return `{ "status": "ok", "uptime": ... }`.
- **Backend Root Status**: Open `https://<YOUR_API_NAME>.onrender.com/` in your browser. It should return `{ "name": "Git Repo Visualizer API", "status": "online", ... }`.
- **Frontend SPA**: Open `https://<YOUR_APP_NAME>.vercel.app`. Test the **"Load Demo Data"** button or enter any public GitHub repository URL.

