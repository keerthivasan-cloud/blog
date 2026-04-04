const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  category: { type: String, required: true },
  content: [{
    _id: false,
    type: { type: String, enum: ['paragraph', 'heading', 'list', 'quote', 'highlight', 'image', 'poll'], required: true },
    text: String,    // For paragraph, heading, quote, highlight
    level: { type: Number, enum: [2, 3] }, // For heading
    items: [String], // For list
    url: String,     // For image
    alt: String,      // For image
    question: String, // For poll
    options: [String] // For poll
  }],
  excerpt: String,
  keyInsight: String,      // NewsForge v2.0 USP
  bullets: [String],       // 30-second Summary Mode
  eli5: String,            // v4.0 Accessibility Mode
  image: String,
  author: { type: String, default: 'Admin' },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  readTime: { type: Number, default: 5 },
  views: { type: Number, default: 0 },
  reactions: {
    fire: { type: Number, default: 0 },
    rocket: { type: Number, default: 0 },
    mindblown: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Article", ArticleSchema);
