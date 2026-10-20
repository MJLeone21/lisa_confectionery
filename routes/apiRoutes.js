const express = require('express');
const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');
const testimonialController = require('../controllers/testimonialController');
const offerController = require('../controllers/offerController');
const stockController = require('../controllers/stockController');
const notificationController = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

/* ---------- Auth (admin-only login; no registration) ---------- */
router.post('/auth/login', authController.login);
router.get('/auth/logout', authController.logout);
router.get('/auth/me', protect, authController.getMe);

/* ---------- Orders ---------- */
// Public: create a booking
router.post('/orders', orderController.createOrderApi);
// Admin: everything else
router.get('/orders', protect, restrictTo('admin'), orderController.getAllOrders);
router.get('/orders/summary', protect, restrictTo('admin'), orderController.getOrderSummary);
router.patch('/orders/:id/status', protect, restrictTo('admin'), orderController.updateOrderStatus);
router.delete('/orders/:id', protect, restrictTo('admin'), orderController.deleteOrder);

/* ---------- Stock (admin only, all of it) ---------- */
router.get('/stock', protect, restrictTo('admin'), stockController.getAllStock);
router.get('/stock/summary', protect, restrictTo('admin'), stockController.getStockSummary);
router.post('/stock', protect, restrictTo('admin'), stockController.createStock);
router.patch('/stock/:id', protect, restrictTo('admin'), stockController.updateStock);
router.delete('/stock/:id', protect, restrictTo('admin'), stockController.deleteStock);

/* ---------- Products (menu/catalogue) ---------- */
router.get('/products', productController.getProducts);
router.post('/products', protect, restrictTo('admin'), productController.createProduct);
router.patch('/products/:id', protect, restrictTo('admin'), productController.updateProduct);
router.delete('/products/:id', protect, restrictTo('admin'), productController.deleteProduct);

/* ---------- Testimonials ---------- */
router.get('/testimonials', testimonialController.getApprovedTestimonials);
router.get('/testimonials/pending', protect, restrictTo('admin'), testimonialController.getPendingTestimonials);
router.patch('/testimonials/:id/approve', protect, restrictTo('admin'), testimonialController.approveTestimonial);
router.delete('/testimonials/:id', protect, restrictTo('admin'), testimonialController.deleteTestimonial);

/* ---------- Offers ---------- */
router.get('/offers', offerController.getActiveOffers);
router.get('/offers/all', protect, restrictTo('admin'), offerController.getAllOffers);
router.post('/offers', protect, restrictTo('admin'), offerController.createOffer);
router.patch('/offers/:id', protect, restrictTo('admin'), offerController.updateOffer);
router.delete('/offers/:id', protect, restrictTo('admin'), offerController.deleteOffer);

/* ---------- Notifications (admin only) ---------- */
router.get('/notifications', protect, restrictTo('admin'), notificationController.getNotifications);
router.patch('/notifications/mark-all-read', protect, restrictTo('admin'), notificationController.markAllRead);
router.delete('/notifications/:id', protect, restrictTo('admin'), notificationController.deleteNotification);

module.exports = router;
