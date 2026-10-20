const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const { isLoggedIn } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/error');

const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const apiRoutes = require('./routes/apiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Attach req.user / res.locals.user (if logged in) on every request
app.use(isLoggedIn);
app.use(async (req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.whatsappNumber = process.env.WHATSAPP_NUMBER;
  res.locals.unreadNotifications = 0;
  if (res.locals.user) {
    try {
      const Notification = require('./models/Notification');
      res.locals.unreadNotifications = await Notification.countDocuments({ read: false });
    } catch (err) {
      // non-fatal — the nav just shows no badge if this fails
    }
  }
  next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/book', bookingRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/', pageRoutes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
