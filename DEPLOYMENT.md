# Deployment Guide

This guide outlines how to deploy the **Git Repository Visualizer** project. The project is split into a Node.js Express backend and a React/Vite frontend.

- **Backend** will be deployed on **Render**
- **Frontend** will be deployed on **Vercel**

---

## 1. Backend Deployment on Render

Render will host the Node.js API server located in the `backend/` directory.

### Setup Steps:
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your Git repository.
3. Configure the following fields:
   - **Name**: `git-repo-visualizer-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Expand the **Advanced** section to add **Environment Variables** (Secrets).

### Environment Variables on Render:

| Key | Value / Description | Example |
| :--- | :--- | :--- |
| `PORT` | `5001` or let Render assign automatically | `5001` |
| `GITHUB_TOKEN` | Your GitHub Personal Access Token (for live data queries). Leave blank to use Demo Mode. | `ghp_yourTokenHere` |
| `JWT_SECRET` | A secure random string for signing JWT tokens | `super_secret_jwt_key` |
| `SESSION_SECRET` | A secure random string for sessions | `super_secret_session_key` |
| `FRONTEND_URL` | The URL of your Vercel frontend | `https://your-app-name.vercel.app` |
| `BACKEND_URL` | The URL of this Render web service (needed for GitHub OAuth callbacks) | `https://your-backend-name.onrender.com` |
| `MONGODB_URI` | *(Optional)* If your application saves persistent user data to a database. | `mongodb+srv://...` |

---

## 2. Frontend Deployment on Vercel

Vercel will host the React/Vite application located in the `frontend/` directory.

### Setup Steps:
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import your Git repository.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**.
   - **Build and Output Settings**: Keep defaults (Build Command: `npm run build`, Output Directory: `dist`).
   - **Install Command**: `npm install`
4. Expand the **Environment Variables** section.

### Environment Variables on Vercel:

| Key | Value / Description |
| :--- | :--- |
| `VITE_BACKEND_URL` | The URL of your deployed Render backend (e.g. `https://your-backend-name.onrender.com`) |

---

## 3. Security Check: Keeping Secrets Hidden

All environment variables and secrets are handled securely and kept out of version control:
- Local `.env` files are ignored in both [backend/.gitignore](file:///e:/projectss/Git%20repo%20visualizer/backend/.gitignore) and [frontend/.gitignore](file:///e:/projectss/Git%20repo%20visualizer/frontend/.gitignore).
- No production credentials or GitHub tokens are committed to git.
- When running locally, configure variables in a local `.env` file within the `backend/` or `frontend/` folders.
