import crypto from 'crypto';
import { GitHubService } from './githubService.js';

/**
 * Service for calculating code similarity
 */
export class SimilarityService {
  constructor() {
    this.githubService = new GitHubService();
  }

  /**
   * Normalizes code by removing comments, whitespace, and normalizing variables
   * @param {string} code - Source code
   * @returns {string} - Normalized code
   */
  normalizeCode(code) {
    if (!code || typeof code !== 'string') {
      return '';
    }

    let normalized = code;

    // Remove single-line comments
    normalized = normalized.replace(/\/\/.*$/gm, '');

    // Remove multi-line comments
    normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove string literals (basic approach)
    normalized = normalized.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '');

    // Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ');

    // Remove leading/trailing whitespace
    normalized = normalized.trim();

    return normalized;
  }

  /**
   * Generates hash for code block
   * @param {string} code - Source code
   * @returns {string} - Hash value
   */
  generateHash(code) {
    const normalized = this.normalizeCode(code);
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Splits code into chunks for comparison
   * @param {string} code - Source code
   * @param {number} chunkSize - Lines per chunk
   * @returns {Array<string>} - Array of code chunks
   */
  createCodeChunks(code, chunkSize = 15) {
    const lines = code.split('\n');
    const chunks = [];

    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize).join('\n');
      if (chunk.trim().length > 50) {
        // Only include substantial chunks
        chunks.push(chunk);
      }
    }

    return chunks;
  }

  /**
   * Calculates similarity between two code strings
   * @param {string} code1 - First code string
   * @param {string} code2 - Second code string
   * @returns {number} - Similarity percentage (0-100)
   */
  calculateSimilarity(code1, code2) {
    const normalized1 = this.normalizeCode(code1);
    const normalized2 = this.normalizeCode(code2);

    if (!normalized1 || !normalized2) {
      return 0;
    }

    // Use longest common subsequence algorithm
    const lcs = this.longestCommonSubsequence(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);

    if (maxLength === 0) {
      return 0;
    }

    return Math.round((lcs / maxLength) * 100);
  }

  /**
   * Longest Common Subsequence algorithm
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Length of LCS
   */
  longestCommonSubsequence(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Analyzes files and searches for similar code on GitHub
   * @param {Array} files - Array of file objects with content
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeFiles(files) {
    const results = {
      similarity: 0,
      matchedRepositories: [],
      matchedFiles: [],
      totalFiles: files.length,
    };

    if (files.length === 0) {
      return results;
    }

    const repositoryMatches = new Map();
    let totalSimilarity = 0;
    let analyzedFiles = 0;

    for (const file of files) {
      if (!file.content || file.content.length < 50) {
        continue; // Skip very small files
      }

      const chunks = this.createCodeChunks(file.content);
      let fileSimilarity = 0;
      let fileMatches = 0;

      for (const chunk of chunks.slice(0, 5)) {
        // Limit chunks per file to avoid rate limits
        try {
          const repos = await this.githubService.searchCode(chunk);

          for (const repo of repos) {
            if (!repositoryMatches.has(repo.url)) {
              repositoryMatches.set(repo.url, {
                url: repo.url,
                name: repo.name,
                matches: 0,
                files: [],
              });
            }

            const repoData = repositoryMatches.get(repo.url);
            repoData.matches += repo.matches;

            if (!repoData.files.includes(file.name)) {
              repoData.files.push(file.name);
            }

            fileMatches++;
          }

          // Calculate chunk similarity (simplified)
          if (repos.length > 0) {
            fileSimilarity += Math.min(100, repos.length * 15);
          }
        } catch (error) {
          console.error(`Error analyzing chunk in ${file.name}:`, error.message);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (fileMatches > 0) {
        fileSimilarity = Math.min(100, fileSimilarity / chunks.length);
        totalSimilarity += fileSimilarity;
        analyzedFiles++;

        if (fileSimilarity > 30) {
          results.matchedFiles.push({
            name: file.name,
            similarity: Math.round(fileSimilarity),
          });
        }
      }
    }

    // Calculate overall similarity
    if (analyzedFiles > 0) {
      results.similarity = Math.round(totalSimilarity / analyzedFiles);
    }

    // Sort repositories by match count
    results.matchedRepositories = Array.from(repositoryMatches.values())
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 10); // Top 10 matches

    return results;
  }

  /**
   * Determines risk level based on similarity percentage
   * @param {number} similarity - Similarity percentage
   * @returns {string} - Risk level: 'Low', 'Medium', 'High'
   */
  getRiskLevel(similarity) {
    if (similarity < 30) {
      return 'Low';
    } else if (similarity < 70) {
      return 'Medium';
    } else {
      return 'High';
    }
  }
}
