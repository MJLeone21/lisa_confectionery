const User = require('../models/User');
const { sendTokenCookie } = require('../middleware/auth');
const { catchAsync } = require('../middleware/error');
const notify = require('../utils/notify');

const isApi = (req) => req.originalUrl.startsWith('/api');

// GET /auth/login — this is an admin-only login. Customers never get accounts;
// their details live on the booking (Order) record instead.
exports.getLoginPage = (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Admin login', error: null, next: req.query.next || '/dashboard' });
};

// POST /auth/login  and  POST /api/auth/login
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const next = req.body.next || '/dashboard';

  if (!email || !password) {
    const message = 'Please provide both email and password.';
    if (isApi(req)) return res.status(400).json({ status: 'fail', message });
    return res.status(400).render('login', { title: 'Admin login', error: message, next });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  const ok = user && (await user.comparePassword(password));

  if (!ok) {
    const message = 'Incorrect email or password.';
    if (isApi(req)) return res.status(401).json({ status: 'fail', message });
    return res.status(401).render('login', { title: 'Admin login', error: message, next });
  }

  sendTokenCookie(res, user._id);
  await notify('login', `${user.name} logged in successfully.`);

  if (isApi(req)) {
    return res.status(200).json({ status: 'success', data: { id: user._id, name: user.name, role: user.role } });
  }
  return res.redirect(next);
});

// GET /auth/logout  and  GET /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  if (isApi(req)) return res.status(200).json({ status: 'success' });
  return res.redirect('/');
};

// GET /api/auth/me
exports.getMe = (req, res) => {
  if (!req.user) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });
  const { _id, name, email, phone, role } = req.user;
  res.status(200).json({ status: 'success', data: { id: _id, name, email, phone, role } });
};
