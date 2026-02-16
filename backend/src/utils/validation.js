/**
 * Validates GitHub repository URL
 * @param {string} url - GitHub repository URL
 * @returns {Object} - { valid: boolean, owner: string, repo: string }
 */
export function validateGitHubUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Support multiple GitHub URL formats
  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/,
    /^github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/,
    /^([^\/]+)\/([^\/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, '').split('/')[0];
      return { valid: true, owner, repo };
    }
  }

  return { valid: false, error: 'Invalid GitHub URL format' };
}

/**
 * Validates file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum size in bytes (default: 10MB)
 * @returns {boolean}
 */
export function validateFileSize(size, maxSize = 10 * 1024 * 1024) {
  return size <= maxSize;
}
