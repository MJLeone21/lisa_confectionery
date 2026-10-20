const Order = require('../models/Order');
const { catchAsync } = require('../middleware/error');
const notify = require('../utils/notify');

const isApi = (req) => req.originalUrl.startsWith('/api');

const OCCASIONS = [
  'Birthday', 'Bridal Shower', 'Baby Shower', 'Wedding',
  'Introduction / Traditional marriage', 'Graduation', 'Other celebration',
];
const CAKE_TYPES = [
  'Bridal Shower Cake', "Children's Cake", 'Wedding Cake',
  'Baby Shower Cake', 'Introduction Cake', 'Treats / Doughnuts / Cupcakes', 'Other',
];
const SIZES = [
  'Small — 8" / 1.5kg', 'Medium — 10" / 3kg', 'Large — 12" / 4.5kg',
  'Extra Large', 'Not sure — please advise',
];
const FLAVOURS = [
  'Vanilla', 'Chocolate', 'Strawberry', 'Red Velvet', 'Chocolate Fudge',
  'Black Forest', 'Fruit cake', 'Coffee', 'Caramel', 'Other / Mixed flavours',
];
const EXTRAS = [
  'Fondant finish', 'Personalised topper', 'Edible image',
  'Fresh flowers / faux decor', 'Chocolate drip',
];
const FULFILMENT = ['Pickup — Kanyanya Road, Kawempe', "Delivery — I'll share my location"];
const STATUSES = ['new', 'in_progress', 'ready', 'delivered', 'cancelled'];

const formOptions = (overrides = {}) => ({
  occasions: OCCASIONS,
  cakeTypes: CAKE_TYPES,
  sizes: SIZES,
  flavours: FLAVOURS,
  extrasList: EXTRAS,
  fulfilmentOptions: FULFILMENT,
  statuses: STATUSES,
  ...overrides,
});

// GET /book — the public booking form
exports.getBookingPage = (req, res) => {
  res.render('order', {
    title: 'Book your cake',
    ...formOptions(),
    prefillCakeType: req.query.item || '',
    error: null,
    values: {},
  });
};

// POST /book — public submission, no login required, no cart involved
exports.createOrderFromForm = catchAsync(async (req, res) => {
  const body = req.body;
  const extras = [].concat(body.extras || []).filter(Boolean);

  const payload = {
    name: body.name,
    phone: body.phone,
    email: body.email || undefined,
    occasion: body.occasion,
    cakeType: body.cakeType,
    size: body.size,
    flavour: body.flavour,
    extras,
    eventDate: body.date,
    fulfilment: body.fulfilment,
    notes: body.notes,
  };

  let order;
  try {
    order = await Order.create(payload);
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'We could not save your booking. Please check the form and try again.';
    return res.status(400).render('order', {
      title: 'Book your cake',
      ...formOptions(),
      prefillCakeType: '',
      error: message,
      values: body,
    });
  }

  await notify('order', `New booking from ${order.name} — ${order.cakeType} (${order.occasion}).`);

  const waLines = [
    `Hi Lisa Confectionery, I just booked a cake on the website:`,
    `Order ref: ${order._id}`,
    `Name: ${order.name}`,
    `Occasion: ${order.occasion}`,
    `Cake: ${order.cakeType}, ${order.size}, ${order.flavour}`,
    `Date needed: ${new Date(order.eventDate).toDateString()}`,
  ];
  const waLink = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(waLines.join('\n'))}`;

  res.render('booking-success', { title: 'Booking received', order, waLink });
});

/* ---------- Admin: manage orders from the dashboard ---------- */

// GET /dashboard/orders/new — admin logs a walk-in / phone booking
exports.getNewOrderPage = (req, res) => {
  res.render('order-form', {
    title: 'Log a new order',
    ...formOptions(),
    mode: 'create',
    order: {},
    error: null,
  });
};

// POST /dashboard/orders/new
exports.createOrderAdmin = catchAsync(async (req, res) => {
  const body = req.body;
  const extras = [].concat(body.extras || []).filter(Boolean);
  try {
    const order = await Order.create({
      name: body.name,
      phone: body.phone,
      email: body.email || undefined,
      occasion: body.occasion,
      cakeType: body.cakeType,
      size: body.size,
      flavour: body.flavour,
      extras,
      eventDate: body.date,
      fulfilment: body.fulfilment,
      notes: body.notes,
      amount: body.amount || 0,
      status: body.status || 'new',
    });
    await notify('order', `Order logged manually for ${order.name}.`);
    res.redirect('/dashboard?tab=orders');
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'Could not save that order.';
    res.status(400).render('order-form', {
      title: 'Log a new order',
      ...formOptions(),
      mode: 'create',
      order: body,
      error: message,
    });
  }
});

// GET /dashboard/orders/:id/edit
exports.getEditOrderPage = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).render('error', { title: 'Not found', message: 'That order does not exist.' });
  res.render('order-form', {
    title: 'Edit order',
    ...formOptions(),
    mode: 'edit',
    order,
    error: null,
  });
});

// POST /dashboard/orders/:id/edit
exports.updateOrderAdmin = catchAsync(async (req, res) => {
  const body = req.body;
  const extras = [].concat(body.extras || []).filter(Boolean);
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name,
        phone: body.phone,
        email: body.email || undefined,
        occasion: body.occasion,
        cakeType: body.cakeType,
        size: body.size,
        flavour: body.flavour,
        extras,
        eventDate: body.date,
        fulfilment: body.fulfilment,
        notes: body.notes,
        amount: body.amount || 0,
        status: body.status,
      },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).render('error', { title: 'Not found', message: 'That order does not exist.' });
    res.redirect('/dashboard?tab=orders');
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'Could not update that order.';
    res.status(400).render('order-form', {
      title: 'Edit order',
      ...formOptions(),
      mode: 'edit',
      order: { ...body, _id: req.params.id },
      error: message,
    });
  }
});

/* ---------- JSON API ---------- */

// POST /api/orders — JSON version of the public booking flow
exports.createOrderApi = catchAsync(async (req, res) => {
  const body = req.body;
  const extras = [].concat(body.extras || []).filter(Boolean);
  const order = await Order.create({
    name: body.name,
    phone: body.phone,
    email: body.email,
    occasion: body.occasion,
    cakeType: body.cakeType,
    size: body.size,
    flavour: body.flavour,
    extras,
    eventDate: body.date || body.eventDate,
    fulfilment: body.fulfilment,
    notes: body.notes,
  });
  await notify('order', `New booking from ${order.name} — ${order.cakeType} (${order.occasion}).`);
  res.status(201).json({ status: 'success', data: order });
});

// GET /api/orders — admin only, every order
exports.getAllOrders = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter).sort('-createdAt');
  res.status(200).json({ status: 'success', results: orders.length, data: orders });
});

// PATCH /api/orders/:id/status — admin only, quick status change (used by the dashboard dropdown)
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid status value.' });
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found.' });
  res.status(200).json({ status: 'success', data: order });
});

// DELETE /api/orders/:id — admin only
exports.deleteOrder = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found.' });
  await notify('order', `Order for ${order.name} was deleted.`);
  res.status(204).json({ status: 'success', data: null });
});

// GET /api/orders/summary — admin only, KPI numbers incl. revenue/spend/profit
exports.getOrderSummary = catchAsync(async (req, res) => {
  const StockItem = require('../models/StockItem');
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [ordersThisMonth, pending, total, revenueAgg, spendAgg] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ status: { $in: ['new', 'in_progress'] } }),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    StockItem.aggregate([{ $group: { _id: null, total: { $sum: '$cost' } } }]),
  ]);

  const revenue = revenueAgg[0] ? revenueAgg[0].total : 0;
  const spend = spendAgg[0] ? spendAgg[0].total : 0;

  res.status(200).json({
    status: 'success',
    data: { ordersThisMonth, pending, total, revenue, spend, profit: revenue - spend },
  });
});
