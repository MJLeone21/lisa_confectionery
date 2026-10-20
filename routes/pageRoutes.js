const express = require('express');
const pageController = require('../controllers/pageController');
const testimonialController = require('../controllers/testimonialController');

const router = express.Router();

router.get('/', pageController.getHome);
router.get('/about', pageController.getAbout);
router.get('/menu', pageController.getMenu);
router.get('/gallery', pageController.getGallery);
router.get('/contact', pageController.getContact);
router.post('/contact', pageController.submitContact);

router.get('/blog', pageController.getBlogList);
router.get('/blog/:slug', pageController.getBlogPost);

router.get('/offers', pageController.getOffers);

router.get('/reviews', pageController.getTestimonials);
router.post('/reviews', testimonialController.submitTestimonial);

module.exports = router;
