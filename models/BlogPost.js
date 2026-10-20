const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tag: { type: String, trim: true }, // e.g. "Cake care", "Celebration ideas"
    excerpt: { type: String, required: true, trim: true },
    body: { type: String, required: true }, // simple paragraphs, split on double newline in the view
    coverImage: { type: String, required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogPost', blogPostSchema);
