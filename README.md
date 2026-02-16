# GitHub Project Copy Detector

A full-stack web application that detects whether a project is copied from GitHub repositories by analyzing code similarity.

## Features

- **GitHub Repository Analysis**: Analyze any public GitHub repository
- **ZIP File Upload**: Upload and analyze local project files
- **Similarity Detection**: Advanced code normalization and comparison algorithms
- **Risk Assessment**: Categorizes projects as Low, Medium, or High risk
- **Matched Repositories**: Shows which GitHub repositories contain similar code
- **File-Level Matching**: Highlights specific files with high similarity

## Tech Stack

### Backend
- Node.js + Express
- GitHub API integration
- ZIP file extraction
- Code similarity algorithms

### Frontend
- React 18
- Vite
- TailwindCSS
- Modern dark UI

## Project Structure

```
Project_detector/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── routes/
│   │   │   └── analyze.js
│   │   ├── services/
│   │   │   ├── githubService.js
│   │   │   ├── similarityService.js
│   │   │   └── zipService.js
│   │   └── utils/
│   │       └── validation.js
│   ├── uploads/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputSection.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProjectDetector.jsx
│   │   │   └── ResultsSection.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- GitHub Personal Access Token (for better API rate limits)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your GitHub token:
```
PORT=3001
GITHUB_TOKEN=your_github_personal_access_token_here
NODE_ENV=development
```

5. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Using GitHub URL**:
   - Enter a GitHub repository URL (e.g., `https://github.com/owner/repo` or `owner/repo`)
   - Click "Check Project"

2. **Using ZIP File**:
   - Drag and drop a ZIP file or click to select
   - Maximum file size: 10MB
   - Only `.js`, `.jsx`, `.ts`, `.tsx`, and `.json` files are analyzed
   - Click "Check Project"

3. **View Results**:
   - Similarity percentage (0-100%)
   - Risk level (Low/Medium/High)
   - Matched GitHub repositories
   - Matched files with similarity scores

## How It Works

1. **Code Normalization**:
   - Removes comments (single-line and multi-line)
   - Removes string literals
   - Normalizes whitespace
   - Creates code chunks for comparison

2. **Similarity Detection**:
   - Uses Longest Common Subsequence (LCS) algorithm
   - Generates hashes for code blocks
   - Searches GitHub Code Search API for similar code

3. **Risk Assessment**:
   - **Low (0-30%)**: Minimal similarity, likely original
   - **Medium (30-70%)**: Moderate similarity, may contain copied code
   - **High (70-100%)**: High similarity, likely copied

## API Endpoints

### POST /api/analyze

Analyzes a project for GitHub similarity.

**Request Body** (multipart/form-data):
- `githubUrl` (optional): GitHub repository URL
- `zipFile` (optional): ZIP file upload

**Response**:
```json
{
  "similarity": 45,
  "riskLevel": "Medium",
  "matchedRepositories": [
    {
      "url": "https://github.com/owner/repo",
      "name": "owner/repo",
      "matches": 5,
      "files": ["file1.js", "file2.js"]
    }
  ],
  "matchedFiles": [
    {
      "name": "file1.js",
      "similarity": 78
    }
  ],
  "totalFilesAnalyzed": 10,
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

## Security Features

- Rate limiting (50 requests per 15 minutes per IP)
- File size validation (10MB limit)
- Input validation for GitHub URLs
- Error handling and cleanup

## Limitations

- GitHub API rate limits (60 requests/hour without token, 5000/hour with token)
- Code search may not find all matches due to API limitations
- Analysis is limited to JavaScript/TypeScript files
- Large repositories may take time to analyze

## Development

### Backend Development
- Uses ES modules (`type: "module"`)
- Async/await throughout
- Modular service architecture
- Comprehensive error handling

### Frontend Development
- React hooks (useState, useRef)
- Component-based architecture
- Responsive design with TailwindCSS
- Loading states and error handling

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
