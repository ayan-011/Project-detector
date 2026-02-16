function LoadingSpinner() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-400 text-lg">Analyzing project...</p>
      <p className="mt-2 text-gray-500 text-sm">This may take a few moments</p>
    </div>
  );
}

export default LoadingSpinner;
