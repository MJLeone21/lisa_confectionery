const Testimonial = require('../models/Testimonial');
const { catchAsync } = require('../middleware/error');
const notify = require('../utils/notify');

/* ---------- Public ---------- */

// GET /api/testimonials — approved only
exports.getApprovedTestimonials = catchAsync(async (req, res) => {
  const testimonials = await Testimonial.find({ approved: true }).sort('-createdAt');
  res.status(200).json({ status: 'success', results: testimonials.length, data: testimonials });
});

// POST /reviews — public submission from the reviews page, held for admin approval
exports.submitTestimonial = catchAsync(async (req, res) => {
  const { name, quote, rating, cakeType } = req.body;
  const t = await Testimonial.create({ name, quote, rating, cakeType, approved: false });
  await notify('testimonial', `New review submitted by ${t.name}, awaiting approval.`);
  res.redirect('/reviews?submitted=1');
});

/* ---------- Admin dashboard pages ---------- */

// GET /dashboard/testimonials/:id/edit
exports.getEditTestimonialPage = catchAsync(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).render('error', { title: 'Not found', message: 'That review does not exist.' });
  res.render('testimonial-form', { title: 'Edit review', testimonial, error: null });
});

// POST /dashboard/testimonials/:id/edit
exports.updateTestimonialPage = catchAsync(async (req, res) => {
  const { name, quote, rating, cakeType } = req.body;
  const approved = req.body.approved === 'on';
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { name, quote, rating, cakeType, approved },
      { new: true, runValidators: true }
    );
    if (!testimonial) return res.status(404).render('error', { title: 'Not found', message: 'That review does not exist.' });
    res.redirect('/dashboard?tab=testimonials');
  } catch (err) {
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join('. ')
      : 'Could not update that review.';
    res.status(400).render('testimonial-form', { title: 'Edit review', testimonial: { ...req.body, _id: req.params.id }, error: message });
  }
});

/* ---------- JSON API (admin only) ---------- */

exports.getPendingTestimonials = catchAsync(async (req, res) => {
  const testimonials = await Testimonial.find({ approved: false }).sort('-createdAt');
  res.status(200).json({ status: 'success', results: testimonials.length, data: testimonials });
});

exports.approveTestimonial = catchAsync(async (req, res) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
  if (!t) return res.status(404).json({ status: 'fail', message: 'Testimonial not found.' });
  await notify('testimonial', `Review by ${t.name} approved and now live.`);
  res.status(200).json({ status: 'success', data: t });
});

exports.deleteTestimonial = catchAsync(async (req, res) => {
  const t = await Testimonial.findByIdAndDelete(req.params.id);
  if (!t) return res.status(404).json({ status: 'fail', message: 'Testimonial not found.' });
  await notify('testimonial', `Review by ${t.name} was deleted.`);
  res.status(204).json({ status: 'success', data: null });
});
