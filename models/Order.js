const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Customers never create accounts — their info lives on the order itself.
    name: { type: String, required: [true, 'Please tell us your name'], trim: true },
    phone: { type: String, required: [true, 'Please provide a phone number'], trim: true },
    email: { type: String, trim: true, lowercase: true },

    occasion: {
      type: String,
      required: [true, 'Please choose an occasion'],
      enum: [
        'Birthday',
        'Bridal Shower',
        'Baby Shower',
        'Wedding',
        'Introduction / Traditional marriage',
        'Graduation',
        'Other celebration',
      ],
    },
    cakeType: {
      type: String,
      required: [true, 'Please choose a cake category'],
      enum: [
        'Bridal Shower Cake',
        "Children's Cake",
        'Wedding Cake',
        'Baby Shower Cake',
        'Introduction Cake',
        'Treats / Doughnuts / Cupcakes',
        'Other',
      ],
    },
    size: { type: String, required: [true, 'Please choose a size'] },
    flavour: { type: String, required: [true, 'Please choose a flavour'] },
    extras: [{ type: String }],

    eventDate: { type: Date, required: [true, 'Please pick a date'] },
    fulfilment: {
      type: String,
      enum: ['Pickup — Kanyanya Road, Kawempe', "Delivery — I'll share my location"],
      required: [true, 'Please choose pickup or delivery'],
    },
    notes: { type: String, trim: true },

    // Agreed final price — the admin fills this in once the design/price is confirmed.
    // Only orders marked "delivered" count toward revenue on the dashboard.
    amount: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ['new', 'in_progress', 'ready', 'delivered', 'cancelled'],
      default: 'new',
    },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
