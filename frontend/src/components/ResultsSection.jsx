function ResultsSection({ results }) {
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low':
        return 'text-green-400 bg-green-900/30 border-green-500';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-500';
      case 'High':
        return 'text-red-400 bg-red-900/30 border-red-500';
      default:
        return 'text-gray-400 bg-gray-800 border-gray-600';
    }
  };

  return (
    <div className="mt-12 space-y-6">
      {/* Similarity Score */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
          <span
            className={`px-4 py-2 rounded-lg border font-semibold ${getRiskColor(
              results.riskLevel
            )}`}
          >
            {results.riskLevel} Risk
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-gray-400">Similarity Score:</span>
            <span className="text-4xl font-bold text-white">{results.similarity}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mt-4">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                results.similarity < 30
                  ? 'bg-green-500'
                  : results.similarity < 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${results.similarity}%` }}
            ></div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          Analyzed {results.totalFilesAnalyzed} file(s)
        </p>
      </div>

      {/* Matched Repositories */}
      {results.matchedRepositories && results.matchedRepositories.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            Matched Repositories ({results.matchedRepositories.length})
          </h3>
          <div className="space-y-3">
            {results.matchedRepositories.map((repo, index) => (
              <div
                key={index}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium break-all"
                >
                  {repo.name}
                </a>
                <p className="text-sm text-gray-400 mt-1">
                  {repo.matches} match{repo.matches !== 1 ? 'es' : ''} found
                </p>
                {repo.files && repo.files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {repo.files.slice(0, 5).map((file, fileIndex) => (
                      <span
                        key={fileIndex}
                        className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300"
                      >
                        {file}
                      </span>
                    ))}
                    {repo.files.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{repo.files.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matched Files */}
      {results.matchedFiles && results.matchedFiles.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            Matched Files ({results.matchedFiles.length})
          </h3>
          <div className="space-y-2">
            {results.matchedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 border border-gray-700"
              >
                <span className="text-gray-300 font-mono text-sm">{file.name}</span>
                <span className="text-yellow-400 font-semibold">
                  {file.similarity}% match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Matches */}
      {results.similarity === 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <p className="text-gray-400 text-lg">
            No significant matches found. This project appears to be original.
          </p>
        </div>
      )}
    </div>
  );
}

export default ResultsSection;
