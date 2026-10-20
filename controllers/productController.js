const Product = require('../models/Product');
const { catchAsync } = require('../middleware/error');
const notify = require('../utils/notify');

const CATEGORIES = ['bridal', 'kids', 'wedding', 'babyshower', 'introduction', 'treats'];

/* ---------- Public ---------- */

exports.getProducts = catchAsync(async (req, res) => {
  const filter = { active: true };
  if (req.query.category) filter.category = req.query.category;
  const products = await Product.find(filter).sort('category order');
  res.status(200).json({ status: 'success', results: products.length, data: products });
});

/* ---------- Admin dashboard pages ---------- */

// GET /dashboard/products/new
exports.getNewProductPage = (req, res) => {
  res.render('product-form', { title: 'Add product', mode: 'create', categories: CATEGORIES, product: {}, error: null });
};

// POST /dashboard/products/new
exports.createProductPage = catchAsync(async (req, res) => {
  try {
    const body = req.body;
    const product = await Product.create({
      name: body.name,
      category: body.category,
      image: body.image,
      priceLabel: body.priceLabel,
      note: body.note,
      active: body.active === 'on',
      order: body.order || 0,
    });
    await notify('product', `New product added to the menu: ${product.name}.`);
    res.redirect('/dashboard?tab=products');
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'Could not save that product.';
    res.status(400).render('product-form', { title: 'Add product', mode: 'create', categories: CATEGORIES, product: req.body, error: message });
  }
});

// GET /dashboard/products/:id/edit
exports.getEditProductPage = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).render('error', { title: 'Not found', message: 'That product does not exist.' });
  res.render('product-form', { title: 'Edit product', mode: 'edit', categories: CATEGORIES, product, error: null });
});

// POST /dashboard/products/:id/edit
exports.updateProductPage = catchAsync(async (req, res) => {
  try {
    const body = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name,
        category: body.category,
        image: body.image,
        priceLabel: body.priceLabel,
        note: body.note,
        active: body.active === 'on',
        order: body.order || 0,
      },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).render('error', { title: 'Not found', message: 'That product does not exist.' });
    res.redirect('/dashboard?tab=products');
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'Could not update that product.';
    res.status(400).render('product-form', { title: 'Edit product', mode: 'edit', categories: CATEGORIES, product: { ...req.body, _id: req.params.id }, error: message });
  }
});

/* ---------- JSON API (admin only for writes) ---------- */

exports.createProduct = catchAsync(async (req, res) => {
  const product = await Product.create(req.body);
  await notify('product', `New product added to the menu: ${product.name}.`);
  res.status(201).json({ status: 'success', data: product });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found.' });
  res.status(200).json({ status: 'success', data: product });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found.' });
  await notify('product', `Product removed from the menu: ${product.name}.`);
  res.status(204).json({ status: 'success', data: null });
});
