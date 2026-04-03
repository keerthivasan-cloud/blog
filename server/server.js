const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Article = require("./models/Article");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/newsforge";

mongoose.connect(MONGO_URI)
  .then(() => console.log("NewsForge Database Connected Successfully"))
  .catch(err => console.error("Database Connection Error:", err));

// --- API ROUTES ---

// Create Article
app.post("/api/articles", async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get All Articles
app.get("/api/articles", async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (status) query.status = status;
    
    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Article by Slug
app.get("/api/articles/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Article
app.put("/api/articles/:id", async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Article
app.delete("/api/articles/:id", async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sitemap Generator
app.get("/sitemap.xml", async (req, res) => {
  try {
    const articles = await Article.find({ status: "published" });
    const domain = "https://newsforge.in"; // Replace with your actual domain

    const urls = articles.map(a => `
    <url>
      <loc>${domain}/${a.category.toLowerCase().replace(/\s+/g, '-')}/${a.slug}</loc>
      <lastmod>${new Date(a.updatedAt || a.createdAt).toISOString()}</lastmod>
      <priority>0.8</priority>
    </url>`).join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <priority>1.0</priority>
  </url>
  ${urls}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    res.status(500).send({ message: "Error generating sitemap" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
