// Wraps an async route/controller so rejected promises are passed to next()
// instead of crashing the process.
function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

// Global error handler — must be registered last, after all routes.
function errorHandler(err, req, res, next) {
  console.error(err);

  const isApi = req.originalUrl.startsWith('/api');
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join('. ');
  }
  // Mongoose duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `That ${field} is already in use.`;
  }
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID.';
  }

  if (isApi) {
    return res.status(statusCode).json({ status: 'error', message });
  }

  return res.status(statusCode).render('error', {
    title: 'Something went wrong',
    message,
  });
}

function notFound(req, res) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ status: 'fail', message: 'Not found.' });
  }
  return res.status(404).render('error', {
    title: 'Page not found',
    message: "We couldn't find the page you were looking for.",
  });
}

module.exports = { catchAsync, errorHandler, notFound };
