const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Admin-only login. There is no registration route — customers never get
// accounts; admin accounts are created by the seed script (or directly in
// the database). See README for details.
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
