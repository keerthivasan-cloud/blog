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
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://newsforge.in";

mongoose.connect(MONGO_URI)
  .then(() => console.log("NewsForge Database Connected Successfully"))
  .catch(err => console.error("Database Connection Error:", err));

const engine = require("./markdownEngine");

// --- API ROUTES ---

// --- ARTICLE INTELLIGENCE ROUTER ---
const articleRouter = express.Router();

// I. SPECIFIC ACTIONS (Priority High)
articleRouter.get("/trending", (req, res) => {
  const posts = engine.getPosts().slice(0, 6); // Mock trending as top 6 sorted by date
  res.json(posts);
});

articleRouter.post("/:id/view", (req, res) => {
  // Keeping endpoint for frontend compatibility, though stats aren't persisted in MD yet
  res.json({ success: true, message: "Intelligence node accessed" });
});

articleRouter.post("/:id/react", (req, res) => {
  res.json({ success: true });
});

// II. BULK OPERATIONS
articleRouter.get("/", (req, res) => {
  const { category, tag } = req.query;
  let posts = engine.getPosts();
  
  if (category && category !== 'All') {
    posts = posts.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
  }

  if (tag) {
    const t = tag.toLowerCase();
    posts = posts.filter(p => {
      const tags = p.tags || p.seo?.keywords?.split(',').map(s => s.trim().toLowerCase()) || [];
      return tags.includes(t);
    });
  }

  res.json(posts);
});

articleRouter.get("/trending-tags", (req, res) => {
  res.json(engine.getTrendingTags());
});

// III. SLUG RETRIEVAL
articleRouter.get("/:slug", (req, res) => {
  const post = engine.getPostBySlug(req.params.slug);
  if (!post) return res.status(404).json({ message: "Intelligence node not found" });
  res.json(post);
});

// --- MANUAL ARTICLE SYNTHESIS ---
articleRouter.post("/", async (req, res) => {
  try {
    const { title, category, author, readTime, image, excerpt, content, slug: customSlug } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: "Intelligence Node Incomplete: Title and Content required." });
    }

    const slug = customSlug || title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const date = new Date().toISOString().split('T')[0];

    // Block-to-Markdown Conversion Engine
    let mdContent = `---\ntitle: "${title}"\ndate: "${date}"\ncategory: "${category || 'Tech'}"\nreadTime: "${readTime || 5} min"\nimage: "${image || ''}"\nexcerpt: "${excerpt || ''}"\nauthor: "NewsForge"\n---\n\n# ${title}\n\n`;

    if (Array.isArray(content)) {
      content.forEach(block => {
        if (block.type === 'paragraph') mdContent += `${block.text}\n\n`;
        if (block.type === 'heading') mdContent += `${'#'.repeat(block.level || 2)} ${block.text}\n\n`;
        if (block.type === 'list') {
          block.items.forEach(item => { if(item) mdContent += `- ${item}\n`; });
          mdContent += `\n`;
        }
        if (block.type === 'quote') mdContent += `> ${block.text}\n\n`;
        if (block.type === 'highlight') mdContent += `:::insight\n${block.text}\n:::\n\n`;
        if (block.type === 'image') mdContent += `![${block.alt || ''}](${block.url})\n\n`;
      });
    } else if (typeof content === 'string') {
      mdContent += content;
    }

    const filePath = path.join(__dirname, "content", `${slug}.md`);
    fs.writeFileSync(filePath, mdContent);

    res.json({ 
      success: true, 
      message: "Technical node published to archive", 
      slug: slug,
      category: category 
    });
  } catch (error) {
    console.error("Manual Synthesis Failure:", error);
    res.status(500).json({ message: "Failed to publish intelligence node: " + error.message });
  }
});

// Mount specialized router
app.use("/api/articles", articleRouter);
app.use("/api/blogs", articleRouter); // Alias as requested for blogs specific endpoint

// Search Articles
app.get("/api/search", (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const results = engine.searchPosts(q);
  res.json(results);
});


// Sitemap Generator
app.get("/sitemap.xml", async (req, res) => {
  try {
    const articles = await Article.find({ status: "published" });
    const domain = FRONTEND_URL; // Consistent with environment configuration

    const urls = articles.map(a => `
    <url>
      <loc>${domain}/${(a.category || 'intelligence').toLowerCase().replace(/\s+/g, '-')}/${a.slug}</loc>
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

// --- AI INTELLIGENCE SYNTHESIS ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/blogs/generate", async (req, res) => {
  const { topic } = req.body;
  
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR")) {
    return res.status(403).json({ message: "Intelligence Node Inactive: GEMINI_API_KEY required in .env" });
  }

  if (!topic) return res.status(400).json({ message: "No synthesis topic provided" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are a professional financial and technology journalist writing for a premium platform called "NewsForge".
      
      Your task is to write a high-quality blog article for the topic: "${topic}".
      It must feel like it was written by an experienced human writer — NOT AI.
      
      STRICT RULES:
      1. Writing Style:
      - Write in a natural, human tone
      - Avoid robotic or generic phrases
      - Do NOT use phrases like: "In conclusion", "Overall", "This article explores", "In today's world"
      - Use a slightly opinionated, confident tone
      - Make it feel like a real person explaining insights
      
      2. Structure:
      - Strong engaging introduction (hook the reader)
      - 3 to 5 meaningful sections with clear headings
      - Each section should provide real value (not filler)
      - Use short and medium-length paragraphs (avoid long blocks)
      
      3. Language:
      - Mix sentence lengths (short + long)
      - Avoid repetition
      - Avoid overuse of keywords
      - Keep it clean, sharp, and readable
      
      4. Content Quality:
      - Add practical insights, examples, or observations
      - Avoid generic statements
      - Make it sound like industry knowledge, not textbook content
      
      5. Output Format (STRICT MARKDOWN):
      ---
      title: "Create a strong, engaging title"
      date: "${new Date().toISOString().split('T')[0]}"
      category: "Tech or Finance or relevant"
      readTime: "5 min"
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000"
      author: "NewsForge"
      ---
      
      # Title
      
      Write the full article here in markdown.
      Use:
      - ## for section headings
      - Clean paragraph spacing
      - No unnecessary symbols
      
      6. Length:
      - Minimum 700 words
      - Maximum 1200 words
      
      7. IMPORTANT:
      - Do NOT mention AI
      - Do NOT sound like AI
      - Do NOT repeat structure patterns
      - Avoid fluff — every paragraph should matter
      - Do NOT wrap the content in backticks (\`\`\`).
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean potential AI code block markers if they exist
    const cleanText = text.replace(/^```markdown\n/, "").replace(/\n```$/, "").trim();
    
    // Force NewsForge as author in metadata if not present
    let finalContent = cleanText;
    if (!cleanText.includes('author: "NewsForge"')) {
      finalContent = cleanText.replace(/author:\s*".*?"/, 'author: "NewsForge"');
    }

    // Extract title & image metadata
    const titleMatch = finalContent.match(/title:\s*"(.*?)"/);
    const title = titleMatch ? titleMatch[1] : topic;
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    
    // Construct dynamic image from keyword or title
    const keywordMatch = finalContent.match(/imageKeyword:\s*"(.*?)"/);
    const keyword = keywordMatch ? keywordMatch[1] : title.split(' ').slice(0, 3).join(' ');
    const dynamicImage = `https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&keyword=${encodeURIComponent(keyword)}`;
    
    // Inject the final image URL into metadata and remove imageKeyword
    if (finalContent.includes('imageKeyword:')) {
       finalContent = finalContent.replace(/imageKeyword:\s*".*?"/, `image: "${dynamicImage}"`);
    } else if (!finalContent.includes('image:')) {
       // Insert after readTime if missing
       finalContent = finalContent.replace(/readTime:\s*".*?"/, (m) => `${m}\nimage: "${dynamicImage}"`);
    }

    const filePath = path.join(__dirname, "content", `${slug}.md`);
    fs.writeFileSync(filePath, finalContent);
    
    res.json({ 
      success: true, 
      message: "Intelligence node synthesized and published",
      slug: slug,
      title: title,
      author: "NewsForge"
    });
  } catch (error) {
    console.error("Synthesis Failure:", error);
    res.status(500).json({ message: "Intelligence Synthesis Failed: " + error.message });
  }
});

// File Upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `${BASE_URL}/uploads/${req.file.filename}` });
});

// --- GLOBAL CATCH-ALL & DEBUGGER ---
app.use((req, res) => {
  console.log(`[404 DEBUG] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Intelligence endpoint not found" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
