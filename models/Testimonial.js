const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true, maxlength: 500 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    cakeType: { type: String, trim: true },
    image: { type: String }, // optional filename under /public/assets
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
