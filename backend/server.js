const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
require("dotenv").config();

const multer = require("multer");

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'https://newsforge.in',
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());


// --- MULTER CONFIG (Memory Storage) ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- AUTH MIDDLEWARE ---
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_PASSWORD || 'admin123';
  if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(403).json({ message: "Network Integrity: Invalid Terminal Key." });
  }
  next();
};

const PORT = process.env.PORT || 5001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://newsforge.in";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: Supabase keys are missing from environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("Supabase Client Initialized");

// --- API ROUTES ---

const articleRouter = express.Router();

// 🟢 Health Check (For Render Deployment)
app.get("/health", (req, res) => {
  res.json({ 
    status: "online", 
    timestamp: new Date().toISOString(),
    env_check: {
      supabase: !!process.env.SUPABASE_URL,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

// I. SPECIFIC ACTIONS
articleRouter.get("/trending", async (req, res) => {
  try {
    const { data: posts, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('createdAt', { ascending: false })
      .limit(6);
    if (error) throw error;
    res.json(posts || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

articleRouter.post("/:id/view", async (req, res) => {
  res.json({ success: true, message: "Intelligence node accessed" });
});

articleRouter.post("/:id/react", (req, res) => {
  res.json({ success: true });
});

// II. BULK OPERATIONS
articleRouter.get("/", async (req, res) => {
  try {
    const { category, tag } = req.query;
    
    let query = supabase.from('articles').select('*').eq('status', 'published').order('createdAt', { ascending: false });
    
    if (category && category !== 'All') {
      query = query.ilike('category', category);
    }
    
    const { data: posts, error } = await query;
    if (error) throw error;
    
    let filteredPosts = posts || [];
    
    if (tag) {
      const t = tag.toLowerCase();
      filteredPosts = filteredPosts.filter(p => {
        const tags = p.tags || [];
        return tags.some(s => s.toLowerCase() === t);
      });
    }
    
    res.json(filteredPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

articleRouter.get("/trending-tags", async (req, res) => {
  try {
    const { data: posts, error } = await supabase.from('articles').select('tags').eq('status', 'published');
    if (error) throw error;
    
    const tagFreq = new Map();
    (posts || []).forEach(post => {
      (post.tags || []).forEach(tag => {
        if (!tag) return;
        const normalized = tag.toLowerCase();
        if (normalized.length < 3) return;
        tagFreq.set(normalized, (tagFreq.get(normalized) || 0) + 1);
      });
    });

    const tagsArray = Array.from(tagFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => ({ name: entry[0], count: entry[1] }));
      
    res.json(tagsArray);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// III. SLUG RETRIEVAL
articleRouter.get("/:slug", async (req, res) => {
  try {
    const { data: post, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', req.params.slug)
      .single();
      
    if (error || !post) return res.status(404).json({ message: "Intelligence node not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- MANUAL ARTICLE SYNTHESIS ---
articleRouter.post("/", adminAuth, async (req, res) => {
  try {
    const { title, category, author, readTime, image, excerpt, content, slug: customSlug } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: "Intelligence Node Incomplete: Title and Content required." });
    }

    const slug = customSlug || title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const date = new Date().toISOString();

    // Block-to-Markdown Conversion
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

    // Insert into Supabase
    const { error } = await supabase.from('articles').insert([{
      title,
      slug,
      category: category || 'Tech',
      content: Array.isArray(content) ? content : null,
      markdownContent: mdContent,
      excerpt: excerpt || '',
      image: image || '',
      author: author || 'NewsForge',
      status: 'published',
      readTime: readTime || 5,
      createdAt: date
    }]);

    if (error) throw error;

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
app.use("/api/blogs", articleRouter); // Alias

// Search Articles
app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,category.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order('createdAt', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    res.json(articles || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sitemap Generator
app.get("/sitemap.xml", async (req, res) => {
  try {
    const { data: articles, error } = await supabase.from('articles').select('*').eq('status', 'published');
    if (error) throw error;
    const domain = FRONTEND_URL; 

    const urls = (articles || []).map(a => `
    <url>
      <loc>${domain}/${(a.category || 'intelligence').toLowerCase().replace(/\s+/g, '-')}/${a.slug}</loc>
      <lastmod>${new Date(a.createdAt).toISOString()}</lastmod>
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

// --- AI INTELLIGENCE SYNTHESIS ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/blogs/generate", adminAuth, async (req, res) => {
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

    const date = new Date().toISOString();

    const { error } = await supabase.from('articles').insert([{
      title,
      slug,
      category: 'Intelligence',
      markdownContent: finalContent,
      excerpt: finalContent.substring(0, 150) + "...",
      image: dynamicImage,
      author: 'NewsForge',
      status: 'published',
      readTime: 5,
      createdAt: date
    }]);

    if (error) throw error;

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

// File Upload to Supabase Storage
app.post("/api/upload", adminAuth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  
  try {
     const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
     const fileName = `${Date.now()}-${safeName}`;
     
     const { data, error } = await supabase.storage
       .from('images')
       .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
       });
       
     if (error) throw error;
     
     const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
     res.json({ url: publicUrlData.publicUrl });
  } catch (error) {
     console.error("Storage Upload Failure:", error);
     res.status(500).json({ message: "Storage Upload Failed: " + error.message });
  }
});

// --- GLOBAL CATCH-ALL & DEBUGGER ---
app.use((req, res) => {
  console.log(`[404 DEBUG] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Intelligence endpoint not found" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
