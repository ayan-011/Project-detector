import { useState, useRef } from 'react';
import { analyzeProject } from '../services/api';
import InputSection from './InputSection';
import LoadingSpinner from './LoadingSpinner';
import ResultsSection from './ResultsSection';

function ProjectDetector() {
  const [githubUrl, setGithubUrl] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/zip') {
      setZipFile(file);
      setError(null);
    } else {
      setError('Please upload a valid ZIP file');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/zip') {
      setZipFile(file);
      setError(null);
    } else {
      setError('Please upload a valid ZIP file');
    }
  };

  const handleSubmit = async () => {
    if (!githubUrl && !zipFile) {
      setError('Please provide either a GitHub URL or upload a ZIP file');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await analyzeProject(githubUrl, zipFile);
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGithubUrl('');
    setZipFile(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            GitHub Project Copy Detector
          </h1>
          <p className="text-gray-400 text-lg">
            Detect if a project is copied from GitHub repositories
          </p>
        </div>

        {/* Input Section */}
        <InputSection
          githubUrl={githubUrl}
          setGithubUrl={setGithubUrl}
          zipFile={zipFile}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileSelect={handleFileSelect}
        />

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!githubUrl && !zipFile)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? 'Analyzing...' : 'Check Project'}
          </button>
          {results && (
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner />}

        {/* Results Section */}
        {results && !isLoading && <ResultsSection results={results} />}
      </div>
    </div>
  );
}

export default ProjectDetector;
