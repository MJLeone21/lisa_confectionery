const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// GET  /book  — booking form
// POST /book  — handle submission (works for guests and logged-in customers)
router.get('/', orderController.getBookingPage);
router.post('/', orderController.createOrderFromForm);

module.exports = router;
