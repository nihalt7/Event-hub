/**
 * Global error handler - safe messages, no stack in production
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message || (err.error && (err.error.description || err.error.reason)) || (typeof err.error === 'string' ? err.error : null);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
