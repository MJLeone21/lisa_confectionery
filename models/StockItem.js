const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please name the item'], trim: true },
    category: {
      type: String,
      enum: ['Ingredient', 'Packaging', 'Decoration', 'Equipment', 'Other'],
      default: 'Ingredient',
    },
    quantity: { type: Number, required: [true, 'Please provide a quantity'], min: 0 },
    unit: { type: String, required: [true, 'Please provide a unit'], trim: true }, // e.g. kg, litres, pcs
    cost: { type: Number, required: [true, 'Please provide the amount spent'], min: 0 }, // total UGX spent on this purchase
    supplier: { type: String, trim: true },
    purchaseDate: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

stockItemSchema.index({ purchaseDate: -1 });

module.exports = mongoose.model('StockItem', stockItemSchema);
