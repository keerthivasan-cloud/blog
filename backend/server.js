const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Article = require("./models/Article");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/newsforge";

mongoose.connect(MONGO_URI)
  .then(() => console.log("NewsForge Database Connected Successfully"))
  .catch(err => console.error("Database Connection Error:", err));

// --- API ROUTES ---

// --- ARTICLE INTELLIGENCE ROUTER ---
const articleRouter = express.Router();

// I. SPECIFIC ACTIONS (Priority High)
articleRouter.get("/trending", async (req, res) => {
  try {
    const trending = await Article.find({ status: "published" })
      .sort({ views: -1, createdAt: -1 })
      .limit(6);
    res.json(trending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

articleRouter.post("/:id/view", async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!article) return res.status(404).json({ message: "Intelligence node not found" });
    res.json({ success: true, views: article.views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

articleRouter.post("/:id/react", async (req, res) => {
  try {
    const { type } = req.body;
    const update = {};
    update[`reactions.${type}`] = 1;
    await Article.findByIdAndUpdate(req.params.id, { $inc: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// II. BULK OPERATIONS
articleRouter.get("/", async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (status) query.status = status;
    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

articleRouter.post("/", async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// III. ID/SLUG MODIFICATIONS (Hungry Parameters - Priority Last)
articleRouter.put("/:id", async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

articleRouter.delete("/:id", async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Intelligence node de-indexed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

articleRouter.get("/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ message: "Intelligence node not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mount specialized router
app.use("/api/articles", articleRouter);


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

// --- NEW CAPABILITIES: SEARCH & UPLOAD ---

// Search Articles
app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const articles = await Article.find({
      $and: [
        { status: "published" },
        {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
            { excerpt: { $regex: q, $options: "i" } }
          ]
        }
      ]
    }).sort({ createdAt: -1 }).limit(10);
    
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// File Upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `http://localhost:5001/uploads/${req.file.filename}` });
});

// --- GLOBAL CATCH-ALL & DEBUGGER ---
app.use((req, res) => {
  console.log(`[404 DEBUG] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Intelligence endpoint not found" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
