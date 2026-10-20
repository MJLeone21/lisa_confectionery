const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}

function sendTokenCookie(res, userId) {
  const token = signToken(userId);
  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 30);
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return token;
}

// Non-blocking: if a valid token is present, attach req.user and res.locals.user
// (used on every page so the nav can show "Dashboard / Logout" vs "Login / Register")
async function isLoggedIn(req, res, next) {
  res.locals.user = null;
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      res.locals.user = user;
    }
  } catch (err) {
    // invalid/expired token — just proceed as logged out
  }
  next();
}

// Blocking: requires a valid session. Page routes redirect to /auth/login,
// API routes (under /api) get a 401 JSON response instead.
function protect(req, res, next) {
  if (req.user) return next();
  if (req.originalUrl.startsWith('/api')) {
    return res.status(401).json({ status: 'fail', message: 'Please log in to continue.' });
  }
  return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl)}`);
}

// Restricts access to specific roles, e.g. restrictTo('admin')
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({ status: 'fail', message: 'You do not have permission to do this.' });
      }
      return res.status(403).render('error', {
        title: 'Access denied',
        message: "You don't have permission to view this page.",
      });
    }
    next();
  };
}

module.exports = { signToken, sendTokenCookie, isLoggedIn, protect, restrictTo };
