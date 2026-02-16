function InputSection({
  githubUrl,
  setGithubUrl,
  zipFile,
  isDragging,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}) {
  return (
    <div className="space-y-6">
      {/* GitHub URL Input */}
      <div>
        <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300 mb-2">
          GitHub Repository URL
        </label>
        <input
          id="githubUrl"
          type="text"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/owner/repo or owner/repo"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-900 text-gray-500">OR</span>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload ZIP File
        </label>
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-900/20'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={onFileSelect}
            className="hidden"
            id="zipFile"
          />
          <label
            htmlFor="zipFile"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className="w-12 h-12 text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-gray-400 mb-2">
              Drag & drop a ZIP file here, or click to select
            </span>
            {zipFile && (
              <span className="text-blue-400 font-medium mt-2">
                Selected: {zipFile.name}
              </span>
            )}
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Maximum file size: 10MB. Only .js, .jsx, .ts, .tsx, and .json files will be analyzed.
        </p>
      </div>
    </div>
  );
}

export default InputSection;
