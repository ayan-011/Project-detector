# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- GitHub Personal Access Token (optional but recommended)

## Step 1: Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your GitHub token:
```
PORT=3001
GITHUB_TOKEN=your_token_here
NODE_ENV=development
```

Start backend:
```bash
npm start
```

Backend runs on: http://localhost:3001

## Step 2: Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

## Step 3: Use the Application

1. Open http://localhost:3000 in your browser
2. Either:
   - Enter a GitHub repository URL (e.g., `facebook/react`)
   - OR upload a ZIP file containing your project
3. Click "Check Project"
4. Wait for analysis to complete
5. View results with similarity percentage and matched repositories

## Getting a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scope: `public_repo` (for public repositories)
4. Copy token and add to `.env` file

**Note**: Without a token, you'll have limited API rate limits (60 requests/hour). With a token, you get 5000 requests/hour.

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify Node.js version: `node --version` (should be 18+)
- Check `.env` file exists and has correct format

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify proxy settings in `vite.config.js`

### GitHub API errors
- Verify your GitHub token is valid
- Check rate limit status
- Ensure repository is public (if using URL input)

### ZIP file upload fails
- Ensure file is under 10MB
- Verify file is a valid ZIP archive
- Check that ZIP contains code files (.js, .jsx, .ts, .tsx, .json)
