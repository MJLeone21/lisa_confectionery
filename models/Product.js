const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['bridal', 'kids', 'wedding', 'babyshower', 'introduction', 'treats'],
    },
    image: { type: String, required: true }, // filename under /public/assets
    priceLabel: { type: String, required: true }, // e.g. "From UGX 55,000" or "Custom quote"
    note: { type: String, trim: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // display order within a category
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
