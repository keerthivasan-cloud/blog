const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: String,
  image: String,
  author: { type: String, default: 'Admin' },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  readTime: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Article", ArticleSchema);
