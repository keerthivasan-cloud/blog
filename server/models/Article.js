const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  category: { type: String, required: true },
  content: [{
    _id: false,
    type: { type: String, enum: ['paragraph', 'heading', 'list', 'quote', 'highlight', 'image'], required: true },
    text: String,    // For paragraph, heading, quote, highlight
    level: { type: Number, enum: [2, 3] }, // For heading
    items: [String], // For list
    url: String,     // For image
    alt: String      // For image
  }],
  excerpt: String,
  image: String,
  author: { type: String, default: 'Admin' },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  readTime: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Article", ArticleSchema);
