import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Fetches repository information from GitHub API
 */
export class GitHubService {
  constructor() {
    this.token = GITHUB_TOKEN;
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Detector-App',
    };

    if (this.token) {
      // Support both token and Bearer formats
      this.headers['Authorization'] = this.token.startsWith('ghp_') || this.token.startsWith('github_pat_')
        ? `Bearer ${this.token}`
        : `token ${this.token}`;
    }
  }

  /**
   * Fetches repository contents recursively
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - Path in repository (default: '')
   * @returns {Promise<Array>} - Array of file objects
   */
  async fetchRepositoryContents(owner, repo, path = '') {
    try {
      const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
      const response = await fetch(url, { headers: this.headers });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found');
        }
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please add GITHUB_TOKEN to .env');
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      const files = [];

      // Handle single file response
      if (data.type === 'file') {
        if (this.isCodeFile(data.name)) {
          files.push({
            name: data.name,
            path: data.path,
            url: data.download_url,
            size: data.size,
          });
        }
        return files;
      }

      // Handle directory response
      for (const item of Array.isArray(data) ? data : [data]) {
        if (item.type === 'file' && this.isCodeFile(item.name)) {
          files.push({
            name: item.name,
            path: item.path,
            url: item.download_url,
            size: item.size,
          });
        } else if (item.type === 'dir') {
          // Recursively fetch subdirectories
          const subFiles = await this.fetchRepositoryContents(owner, repo, item.path);
          files.push(...subFiles);
        }
      }

      return files;
    } catch (error) {
      console.error(`Error fetching repository contents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetches file content from GitHub
   * @param {string} url - File download URL
   * @returns {Promise<string>} - File content
   */
  async fetchFileContent(url) {
    try {
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error fetching file content: ${error.message}`);
      throw error;
    }
  }

  /**
   * Searches GitHub for code snippets using Code Search API
   * @param {string} codeSnippet - Code snippet to search for
   * @returns {Promise<Array>} - Array of matching repositories
   */
  async searchCode(codeSnippet) {
    try {
      // Clean and prepare code snippet for search
      const cleanedCode = codeSnippet
        .split('\n')
        .slice(0, 20) // Limit to 20 lines
        .join(' ')
        .replace(/[^\w\s]/g, ' ')
        .trim()
        .substring(0, 200); // Limit length

      if (cleanedCode.length < 20) {
        return [];
      }

      const query = encodeURIComponent(cleanedCode);
      const url = `${GITHUB_API_BASE}/search/code?q=${query}`;

      const response = await fetch(url, { headers: this.headers });

      if (!response.ok) {
        if (response.status === 403) {
          console.warn('GitHub API rate limit exceeded for code search');
          return [];
        }
        return [];
      }

      const data = await response.json();
      const repositories = new Map();

      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items.slice(0, 10)) {
          const repoUrl = item.repository.html_url;
          if (!repositories.has(repoUrl)) {
            repositories.set(repoUrl, {
              url: repoUrl,
              name: item.repository.full_name,
              matches: 1,
            });
          } else {
            repositories.get(repoUrl).matches++;
          }
        }
      }

      return Array.from(repositories.values());
    } catch (error) {
      console.error(`Error searching code: ${error.message}`);
      return [];
    }
  }

  /**
   * Checks if file is a code file we want to analyze
   * @param {string} filename - File name
   * @returns {boolean}
   */
  isCodeFile(filename) {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }
}
