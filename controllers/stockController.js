const StockItem = require('../models/StockItem');
const { catchAsync } = require('../middleware/error');
const notify = require('../utils/notify');

const CATEGORIES = ['Ingredient', 'Packaging', 'Decoration', 'Equipment', 'Other'];

/* ---------- Admin dashboard pages ---------- */

// GET /dashboard/stock/new
exports.getNewStockPage = (req, res) => {
  res.render('stock-form', { title: 'Add stock', mode: 'create', categories: CATEGORIES, item: {}, error: null });
};

// POST /dashboard/stock/new
exports.createStockPage = catchAsync(async (req, res) => {
  try {
    const item = await StockItem.create(req.body);
    await notify('stock', `Stock added: ${item.name} (${item.quantity} ${item.unit}) — UGX ${item.cost.toLocaleString()}.`);
    res.redirect('/dashboard?tab=stock');
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'Could not save that stock item.';
    res.status(400).render('stock-form', { title: 'Add stock', mode: 'create', categories: CATEGORIES, item: req.body, error: message });
  }
});

// GET /dashboard/stock/:id/edit
exports.getEditStockPage = catchAsync(async (req, res) => {
  const item = await StockItem.findById(req.params.id);
  if (!item) return res.status(404).render('error', { title: 'Not found', message: 'That stock item does not exist.' });
  res.render('stock-form', { title: 'Edit stock', mode: 'edit', categories: CATEGORIES, item, error: null });
});

// POST /dashboard/stock/:id/edit
exports.updateStockPage = catchAsync(async (req, res) => {
  try {
    const item = await StockItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).render('error', { title: 'Not found', message: 'That stock item does not exist.' });
    res.redirect('/dashboard?tab=stock');
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'Could not update that stock item.';
    res.status(400).render('stock-form', { title: 'Edit stock', mode: 'edit', categories: CATEGORIES, item: { ...req.body, _id: req.params.id }, error: message });
  }
});

/* ---------- JSON API ---------- */

// GET /api/stock — admin only
exports.getAllStock = catchAsync(async (req, res) => {
  const items = await StockItem.find().sort('-purchaseDate');
  res.status(200).json({ status: 'success', results: items.length, data: items });
});

// POST /api/stock — admin only
exports.createStock = catchAsync(async (req, res) => {
  const item = await StockItem.create(req.body);
  await notify('stock', `Stock added: ${item.name} (${item.quantity} ${item.unit}) — UGX ${item.cost.toLocaleString()}.`);
  res.status(201).json({ status: 'success', data: item });
});

// PATCH /api/stock/:id — admin only
exports.updateStock = catchAsync(async (req, res) => {
  const item = await StockItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ status: 'fail', message: 'Stock item not found.' });
  res.status(200).json({ status: 'success', data: item });
});

// DELETE /api/stock/:id — admin only
exports.deleteStock = catchAsync(async (req, res) => {
  const item = await StockItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ status: 'fail', message: 'Stock item not found.' });
  await notify('stock', `Stock item deleted: ${item.name}.`);
  res.status(204).json({ status: 'success', data: null });
});

// GET /api/stock/summary — admin only, total spend
exports.getStockSummary = catchAsync(async (req, res) => {
  const agg = await StockItem.aggregate([{ $group: { _id: null, total: { $sum: '$cost' } } }]);
  res.status(200).json({ status: 'success', data: { totalSpend: agg[0] ? agg[0].total : 0 } });
});
