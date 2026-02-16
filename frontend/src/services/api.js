import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * Analyzes a project for GitHub similarity
 * @param {string} githubUrl - GitHub repository URL (optional)
 * @param {File} zipFile - ZIP file to analyze (optional)
 * @returns {Promise<Object>} - Analysis results
 */
export async function analyzeProject(githubUrl, zipFile) {
  const formData = new FormData();

  if (githubUrl) {
    formData.append('githubUrl', githubUrl);
  }

  if (zipFile) {
    formData.append('zipFile', zipFile);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for analysis
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(
        error.response.data.error || error.response.data.message || 'Analysis failed'
      );
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Error setting up request
      throw new Error(error.message || 'An error occurred');
    }
  }
}
