const Product = require('../models/Product');
const Testimonial = require('../models/Testimonial');
const Offer = require('../models/Offer');
const BlogPost = require('../models/BlogPost');
const Order = require('../models/Order');
const { catchAsync } = require('../middleware/error');

const CATEGORY_LABELS = {
  bridal: 'Bridal Shower',
  kids: "Children's Cakes",
  wedding: 'Wedding Cakes',
  babyshower: 'Baby Shower',
  introduction: 'Introduction Cakes',
  treats: 'Treats',
};

exports.getHome = catchAsync(async (req, res) => {
  const [testimonials, offer] = await Promise.all([
    Testimonial.find({ approved: true }).sort('-createdAt').limit(3),
    Offer.findOne({ active: true }).sort('-createdAt'),
  ]);
  res.render('home', { title: 'Lisa Confectionery — Cakes & Sweet Treats in Kampala', testimonials, offer });
});

exports.getAbout = (req, res) => {
  res.render('about', { title: 'About Us — Lisa Confectionery' });
};

exports.getMenu = catchAsync(async (req, res) => {
  const products = await Product.find({ active: true }).sort('category order');
  const grouped = {};
  products.forEach((p) => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });
  res.render('menu', {
    title: 'Menu & Catalogue — Lisa Confectionery',
    grouped,
    categoryLabels: CATEGORY_LABELS,
    activeFilter: req.query.category || 'all',
  });
});

exports.getGallery = (req, res) => {
  res.render('gallery', { title: 'Gallery — Lisa Confectionery' });
};

exports.getTestimonials = catchAsync(async (req, res) => {
  const testimonials = await Testimonial.find({ approved: true }).sort('-createdAt');
  res.render('testimonials', {
    title: 'Reviews — Lisa Confectionery',
    testimonials,
    submitted: req.query.submitted === '1',
  });
});

exports.getOffers = catchAsync(async (req, res) => {
  const offers = await Offer.find({
    active: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }],
  }).sort('-createdAt');
  res.render('offers', { title: 'Offers & Promotions — Lisa Confectionery', offers });
});

exports.getContact = (req, res) => {
  res.render('contact', {
    title: 'Contact & Location — Lisa Confectionery',
    sent: req.query.sent === '1',
  });
};

// POST /contact — simple enquiry form (no cart/order involved, just a message)
exports.submitContact = (req, res) => {
  const { name, phone, email, message } = req.body;
  // No email service is configured yet — logged here so it's visible during development.
  // Swap this for a real mailer (e.g. nodemailer) when you have SMTP credentials.
  console.log('New contact enquiry:', { name, phone, email, message });
  res.redirect('/contact?sent=1');
};

exports.getBlogList = catchAsync(async (req, res) => {
  const posts = await BlogPost.find({ published: true }).sort('-createdAt');
  res.render('blog', { title: 'Blog & Tips — Lisa Confectionery', posts });
});

exports.getBlogPost = catchAsync(async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
  if (!post) {
    return res.status(404).render('error', { title: 'Post not found', message: "We couldn't find that article." });
  }
  res.render('blog-post', { title: `${post.title} — Lisa Confectionery`, post });
});

// GET /dashboard — admin only (enforced by restrictTo('admin') on the route).
// One full overview: orders, stock, financials, products, reviews, offers, notifications.
exports.getDashboard = catchAsync(async (req, res) => {
  const StockItem = require('../models/StockItem');
  const Notification = require('../models/Notification');

  const [orders, pendingTestimonials, allTestimonials, offers, products, stockItems, notifications] = await Promise.all([
    Order.find().sort('-createdAt').limit(200),
    Testimonial.find({ approved: false }).sort('-createdAt'),
    Testimonial.find().sort('-createdAt'),
    Offer.find().sort('-createdAt'),
    Product.find().sort('category order'),
    StockItem.find().sort('-purchaseDate'),
    Notification.find().sort('-createdAt').limit(30),
  ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const ordersThisMonth = orders.filter((o) => o.createdAt >= startOfMonth).length;
  const pendingOrders = orders.filter((o) => ['new', 'in_progress'].includes(o.status)).length;

  const revenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.amount || 0), 0);
  const upcomingRevenue = orders
    .filter((o) => ['new', 'in_progress', 'ready'].includes(o.status))
    .reduce((sum, o) => sum + (o.amount || 0), 0);
  const spend = stockItems.reduce((sum, s) => sum + (s.cost || 0), 0);
  const profit = revenue - spend;

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  res.render('dashboard-admin', {
    title: 'Admin Dashboard — Lisa Confectionery',
    activeTab: req.query.tab || 'orders',
    orders,
    pendingTestimonials,
    allTestimonials,
    offers,
    products,
    stockItems,
    notifications,
    unreadNotifications,
    ordersThisMonth,
    pendingOrders,
    totalOrders: orders.length,
    revenue,
    upcomingRevenue,
    spend,
    profit,
  });
});
