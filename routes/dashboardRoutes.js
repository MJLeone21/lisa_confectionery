const express = require('express');
const pageController = require('../controllers/pageController');
const orderController = require('../controllers/orderController');
const stockController = require('../controllers/stockController');
const productController = require('../controllers/productController');
const offerController = require('../controllers/offerController');
const testimonialController = require('../controllers/testimonialController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Every route below is admin-only.
router.use(protect, restrictTo('admin'));

// Overview
router.get('/', pageController.getDashboard);

// Orders
router.get('/orders/new', orderController.getNewOrderPage);
router.post('/orders/new', orderController.createOrderAdmin);
router.get('/orders/:id/edit', orderController.getEditOrderPage);
router.post('/orders/:id/edit', orderController.updateOrderAdmin);

// Stock
router.get('/stock/new', stockController.getNewStockPage);
router.post('/stock/new', stockController.createStockPage);
router.get('/stock/:id/edit', stockController.getEditStockPage);
router.post('/stock/:id/edit', stockController.updateStockPage);

// Products
router.get('/products/new', productController.getNewProductPage);
router.post('/products/new', productController.createProductPage);
router.get('/products/:id/edit', productController.getEditProductPage);
router.post('/products/:id/edit', productController.updateProductPage);

// Offers
router.get('/offers/new', offerController.getNewOfferPage);
router.post('/offers/new', offerController.createOfferPage);
router.get('/offers/:id/edit', offerController.getEditOfferPage);
router.post('/offers/:id/edit', offerController.updateOfferPage);

// Testimonials
router.get('/testimonials/:id/edit', testimonialController.getEditTestimonialPage);
router.post('/testimonials/:id/edit', testimonialController.updateTestimonialPage);

module.exports = router;
