export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.type === 'multer') {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message,
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message || 'An error occurred',
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};
