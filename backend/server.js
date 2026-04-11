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
  const { topic, category: requestedCategory } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR")) {
    return res.status(403).json({ message: "Intelligence Node Inactive: GEMINI_API_KEY required in .env" });
  }

  if (!topic || topic.trim().length < 3) {
    return res.status(400).json({ message: "No synthesis topic provided" });
  }

  const topicClean = topic.trim();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a skilled blog writer who writes in simple, natural, human-like English.

TOPIC: "${topicClean}"

CRITICAL RULE: Write ONLY about this exact topic. Do NOT generalize, drift, or shift to broader subjects. Stay strictly focused on: "${topicClean}"

YOUR WRITING STYLE:
- Write like a real person explaining this to someone who is new to the subject
- Use short sentences. Keep paragraphs to 2–4 lines max
- Avoid jargon. If you must use a technical term, explain it briefly right after
- Add a slight personal or opinionated tone — avoid academic or robotic phrasing
- Use natural phrases like "Let's be honest...", "Here's the reality...", "Most people don't realize..."
- Every sentence must add value. Cut filler. Cut fluff.
- Do NOT sound like AI, Wikipedia, or a textbook
- Do NOT use: "In conclusion", "In today's fast-paced world", "This article explores", "Delve into", "It is worth noting", "Overall", "To summarize"

BLOG STRUCTURE (follow this order):
1. Title — specific, curiosity-driven, directly tied to the topic
2. Hook intro — 2–3 engaging lines that immediately pull the reader in
3. 3–6 main sections using ## H2 headings (choose count based on topic depth)
4. Use ### H3 subsections if a section covers multiple sub-points
5. Use bullet points (-) where listing ideas or steps adds clarity
6. Include real-world examples, comparisons, or relatable scenarios
7. Conclusion — a clear, memorable takeaway (no generic wrap-ups)

LENGTH: 700–1200 words

IMAGE PROMPT RULES:
Create a specific image generation prompt for a blog thumbnail that visually matches the exact topic.
- Style: modern digital art, high contrast, blog thumbnail style
- Must visually represent the EXACT topic — not a generic tech image
- Clear subject focus, minimal or no text overlay
- Vivid and descriptive so an AI image generator can create it

Example — for topic "AI replacing jobs":
"Futuristic illustration of robots and AI systems at office desks while humans observe from a distance, modern digital art, high contrast, blog thumbnail style, cool blue tones"

OUTPUT FORMAT — STRICT:
Return ONLY a valid JSON object. No markdown. No backticks. No explanation. Nothing before or after the JSON.

{
  "title": "Your engaging, topic-specific title",
  "content": "Full markdown article. Use ## for H2 headings, ### for H3, **bold** for key terms, - for bullet lists. No YAML frontmatter inside content.",
  "image_prompt": "Your detailed, topic-specific image generation prompt"
}`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Strip markdown code fences if the model wraps the response
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (_) {
      // Fallback: pull the first JSON object out of a noisy response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI returned a malformed response. Please retry with a clearer topic.");
      parsed = JSON.parse(jsonMatch[0]);
    }

    const { title, content, image_prompt } = parsed;

    if (!title || !content) {
      throw new Error("Incomplete synthesis response. Please retry with a more specific topic.");
    }

    const date = new Date().toISOString();
    const dateShort = date.split("T")[0];
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

    // Expanded curated Unsplash base images (varied visual styles)
    const curatedBases = [
      "1451187580459-43490279c0fa",
      "1518770660439-4636190af475",
      "1550751827-4bd374c3f58b",
      "1639734311735-3c910a7620a7",
      "1611974710112-6e9fa1e7960a",
      "1526303328154-4bac89c0250b",
      "1677442135703-1787eea5ce01",
      "1620712943543-bcc4688e7485",
      "1581090464777-f3220bbe1b8b",
      "1633356122544-f134324a6cee",
      "1504711434969-e33886168f5c",
      "1573496359142-b8d87734a5a2",
      "1485827404703-89b55fcc595e",
      "1569025690938-a00729c9e1f9"
    ];
    const randomBase = curatedBases[Math.floor(Math.random() * curatedBases.length)];
    const dynamicImage = `https://images.unsplash.com/photo-${randomBase}?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3`;

    // Compose full markdown with YAML frontmatter for storage
    const safeTitle = title.replace(/"/g, "'");
    const safeImagePrompt = (image_prompt || "").replace(/"/g, "'");
    const finalMarkdown = `---
title: "${safeTitle}"
date: "${dateShort}"
category: "${requestedCategory || "Intelligence"}"
readTime: "5 min"
image: "${dynamicImage}"
author: "NewsForge"
image_prompt: "${safeImagePrompt}"
---

${content}`;

    // Extract a clean excerpt from body content (no headings/bold markers)
    const excerptBase = content
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*/g, "")
      .replace(/\n+/g, " ")
      .trim();
    const excerpt = excerptBase.substring(0, 220) + "...";

    const { error } = await supabase.from("articles").insert([{
      title,
      slug,
      category: requestedCategory || "Intelligence",
      markdownContent: finalMarkdown,
      excerpt,
      image: dynamicImage,
      author: "NewsForge",
      status: "published",
      readTime: 5,
      createdAt: date
    }]);

    if (error) throw error;

    res.json({
      success: true,
      message: "Intelligence node synthesized and published",
      slug,
      title,
      author: "NewsForge",
      image_prompt
    });
  } catch (error) {
    console.error("Synthesis Failure:", error);
    const userMessage = error.message?.includes("JSON") || error.message?.includes("malformed") || error.message?.includes("Incomplete")
      ? error.message
      : "Intelligence Synthesis Failed: " + error.message;
    res.status(500).json({ message: userMessage });
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
