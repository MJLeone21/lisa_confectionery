const Offer = require('../models/Offer');
const { catchAsync } = require('../middleware/error');
const notify = require('../utils/notify');

/* ---------- Public ---------- */

exports.getActiveOffers = catchAsync(async (req, res) => {
  const offers = await Offer.find({
    active: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }],
  }).sort('-createdAt');
  res.status(200).json({ status: 'success', results: offers.length, data: offers });
});

/* ---------- Admin dashboard pages ---------- */

// GET /dashboard/offers/new
exports.getNewOfferPage = (req, res) => {
  res.render('offer-form', { title: 'Add offer', mode: 'create', offer: {}, error: null });
};

// POST /dashboard/offers/new
exports.createOfferPage = catchAsync(async (req, res) => {
  try {
    const body = req.body;
    const offer = await Offer.create({
      title: body.title,
      description: body.description,
      image: body.image,
      wasPrice: body.wasPrice || undefined,
      nowPrice: body.nowPrice,
      active: body.active === 'on',
      expiresAt: body.expiresAt || undefined,
    });
    await notify('offer', `New offer added: ${offer.title}.`);
    res.redirect('/dashboard?tab=offers');
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'Could not save that offer.';
    res.status(400).render('offer-form', { title: 'Add offer', mode: 'create', offer: req.body, error: message });
  }
});

// GET /dashboard/offers/:id/edit
exports.getEditOfferPage = catchAsync(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).render('error', { title: 'Not found', message: 'That offer does not exist.' });
  res.render('offer-form', { title: 'Edit offer', mode: 'edit', offer, error: null });
});

// POST /dashboard/offers/:id/edit
exports.updateOfferPage = catchAsync(async (req, res) => {
  try {
    const body = req.body;
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        title: body.title,
        description: body.description,
        image: body.image,
        wasPrice: body.wasPrice || undefined,
        nowPrice: body.nowPrice,
        active: body.active === 'on',
        expiresAt: body.expiresAt || undefined,
      },
      { new: true, runValidators: true }
    );
    if (!offer) return res.status(404).render('error', { title: 'Not found', message: 'That offer does not exist.' });
    res.redirect('/dashboard?tab=offers');
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'Could not update that offer.';
    res.status(400).render('offer-form', { title: 'Edit offer', mode: 'edit', offer: { ...req.body, _id: req.params.id }, error: message });
  }
});

/* ---------- JSON API (admin only) ---------- */

exports.getAllOffers = catchAsync(async (req, res) => {
  const offers = await Offer.find().sort('-createdAt');
  res.status(200).json({ status: 'success', results: offers.length, data: offers });
});

exports.createOffer = catchAsync(async (req, res) => {
  const offer = await Offer.create(req.body);
  await notify('offer', `New offer added: ${offer.title}.`);
  res.status(201).json({ status: 'success', data: offer });
});

exports.updateOffer = catchAsync(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!offer) return res.status(404).json({ status: 'fail', message: 'Offer not found.' });
  res.status(200).json({ status: 'success', data: offer });
});

exports.deleteOffer = catchAsync(async (req, res) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);
  if (!offer) return res.status(404).json({ status: 'fail', message: 'Offer not found.' });
  await notify('offer', `Offer deleted: ${offer.title}.`);
  res.status(204).json({ status: 'success', data: null });
});
