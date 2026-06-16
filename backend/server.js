const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
require("dotenv").config();

const multer = require("multer");
const sharp = require("sharp");

// --- UTILS & CONSTANTS ---
const curatedBases = {
  tech:        "1518770665346-f8c7981fb5a6",
  finance:     "1460925895917-afdab827c52f",
  business:    "1519389950473-47ba0277781c",
  markets:     "1526628953301-3e589a6a8b74",
  commodities: "1550751827-4bd374c3f58b",
  default:     "1504384308090-c894fdcc538d",
};

const axios = require("axios");

async function fetchStockImage(searchQuery, category) {
  const query = (searchQuery || category || "technology").substring(0, 120);

  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const { data } = await axios.get("https://api.unsplash.com/search/photos", {
        params: { query, orientation: "landscape", per_page: 5, order_by: "relevant" },
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        timeout: 8000,
      });
      if (data.results && data.results.length > 0) {
        const pick = data.results[Math.floor(Math.random() * Math.min(3, data.results.length))];
        return `${pick.urls.raw}&w=1200&h=800&fit=crop&q=80&auto=format`;
      }
    } catch (e) {
      console.warn("[Image] Unsplash failed:", e.message);
    }
  }

  if (process.env.PEXELS_API_KEY) {
    try {
      const { data } = await axios.get("https://api.pexels.com/v1/search", {
        params: { query, per_page: 5, orientation: "landscape" },
        headers: { Authorization: process.env.PEXELS_API_KEY },
        timeout: 8000,
      });
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.large2x;
      }
    } catch (e) {
      console.warn("[Image] Pexels failed:", e.message);
    }
  }

  const catKey = (category || "").toLowerCase();
  const photoId = curatedBases[catKey] || curatedBases.default;
  return `https://images.unsplash.com/photo-${photoId}?w=1200&h=800&fit=crop&q=80&auto=format`;
}

const app = express();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (!resend) {
  console.warn("⚠️ Resend API key missing. Email service disabled.");
}
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'https://newsforge.in',
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['X-Response-Time'],
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "blob:", "https://*.supabase.co", "https://images.unsplash.com", "https://images.pexels.com", "https://image.pollinations.ai"],
      "connect-src": ["'self'", "https://*.supabase.co", "https://api.unsplash.com", "https://api.pexels.com"]
    }
  }
}));
app.use(hpp());

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 requests per minute
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.warn(`[RATE LIMIT 429] IP: ${req.ip} hit limit on ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});
app.use("/api", globalLimiter);

app.use(express.json());

// API Performance Tracker Middleware
app.use((req, res, next) => {
  const startAt = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(startAt);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    if (timeInMs > 300) {
      console.warn(`[SLOW API] ${req.method} ${req.url} took ${timeInMs}ms`);
    }
  });
  next();
});

// Keep-alive endpoint — pinged by UptimeRobot every 14 min to prevent Render free-tier cold starts
app.get('/health', (req, res) => res.json({ ok: true }));

// --- MULTER CONFIG (Memory Storage) ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- AUTH MIDDLEWARE ---
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (adminSecret === 'admin123' && process.env.NODE_ENV === 'production') {
    console.warn("CRITICAL SECURITY WARNING: Using default ADMIN_PASSWORD ('admin123') in production!");
  }
  
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

// --- SETTINGS API ---
const fs = require('fs');
const settingsPath = './settings.json';

const getSettings = () => {
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  }
  return { siteName: 'NewsForge', themeColor: '#000000', adsenseScript: '', adsensePublisherId: '', logoUrl: '' };
};

app.get(["/api/settings", "/api/settings/"], (req, res) => {
  console.log(`[SETTINGS API] Matched exact path: ${req.url}`);
  res.status(200).json(getSettings());
});

app.put("/api/settings", adminAuth, (req, res) => {
  const current = getSettings();
  const updated = { ...current, ...req.body };
  fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2));
  res.json(updated);
});

// I. SPECIFIC ACTIONS
articleRouter.get("/trending", async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=300');
    const { data: posts, error } = await supabase
      .from('articles')
      .select('id, title, slug, category, excerpt, image, author, readTime, createdAt, tags')
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
    res.setHeader('Cache-Control', 'public, max-age=300');
    const { category, tag, limit = 10, page = 1 } = req.query;
    const pageSize = parseInt(limit);
    const pageNum = parseInt(page);
    const start = (pageNum - 1) * pageSize;

    // Serve from in-memory cache when possible
    const cacheKey = getArticlesCacheKey(category, tag, pageNum, pageSize);
    const cached = _articlesCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < ARTICLES_TTL) {
      return res.json(cached.data);
    }

    let query = supabase
      .from('articles')
      .select('id, title, slug, category, excerpt, image, author, readTime, createdAt, tags')
      .eq('status', 'published')
      .order('createdAt', { ascending: false });

    if (category && category !== 'All') query = query.ilike('category', category);
    if (tag) query = query.contains('tags', [tag.toLowerCase()]);

    // Fetch pageSize+1 to detect if a next page exists — avoids COUNT(*) on every request
    const { data: posts, error } = await query.range(start, start + pageSize);
    if (error) throw error;

    const hasMore = posts.length > pageSize;
    const articles = hasMore ? posts.slice(0, pageSize) : (posts || []);
    const payload = { articles, hasMore, currentPage: pageNum, totalPages: hasMore ? pageNum + 1 : pageNum };

    _articlesCache.set(cacheKey, { data: payload, ts: Date.now() });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const _articlesCache = new Map();
const ARTICLES_TTL = 5 * 60 * 1000;
const getArticlesCacheKey = (category, tag, page, limit) =>
  `${category || 'all'}|${tag || ''}|${page}|${limit}`;

let _tagsCache = null;
let _tagsCacheTs = 0;
const TAGS_TTL = 5 * 60 * 1000;

articleRouter.get("/trending-tags", async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  if (_tagsCache && Date.now() - _tagsCacheTs < TAGS_TTL) {
    return res.json(_tagsCache);
  }
  try {
    const { data: posts, error } = await supabase
      .from('articles')
      .select('tags')
      .eq('status', 'published')
      .order('createdAt', { ascending: false })
      .limit(50);

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

    _tagsCache = tagsArray;
    _tagsCacheTs = Date.now();
    res.json(tagsArray);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rate Limiter for Subscriptions: Max 5 per minute per IP
const subscribeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { success: false, message: "Too many subscription attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// NEW: Subscription Route
articleRouter.post("/subscribe", subscribeLimiter, async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    
    // 1. Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    // 2. Duplicate Check (Strict)
    const { data: existing, error: fetchError } = await supabase
      .from('subscribers')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existing) {
      return res.json({ success: false, message: "Already subscribed" });
    }

    // 3. Insertion
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert([{ email, created_at: new Date().toISOString() }]);

    if (insertError) throw insertError;

    res.json({ success: true, message: "Subscription successful!" });
  } catch (err) {
    console.error("Subscription system failure:", err);
    res.status(500).json({ success: false, message: "Internal terminal logic failure" });
  }
});

// Helper: Notify Subscribers
const notifySubscribers = async (post) => {
  if (!resend) {
    console.log("Email service disabled, skipping subscriber notifications.");
    return;
  }
  try {
    const { data: subs, error } = await supabase.from('subscribers').select('email');
    if (error || !subs || subs.length === 0) return;

    const emails = subs.map(s => s.email);
    
    // Resend batch limit is 100 per call for free tier sometimes, or just use a loop for safety
    // For simplicity, we'll send to all at once if count is small, or loop
    for (const email of emails) {
      await resend.emails.send({
        from: 'NewsForge <onboarding@resend.dev>', // Use verified domain here if you have one
        to: email,
        subject: `New Insight: ${post.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #f97316; text-transform: uppercase; font-size: 24px;">NewsForge Intelligence</h1>
            <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #64748b;">New Protocol Published in ${post.category}</p>
            <h2 style="font-size: 20px; margin-top: 20px;">${post.title}</h2>
            <p style="color: #334155; line-height: 1.6;">${post.excerpt || 'A new strategic analysis has been published on NewsForge. Click below to read the full intelligence report.'}</p>
            <a href="https://newsforge-v1.vercel.app/${post.category.toLowerCase().replace(/\s+/g, '-')}/${post.slug}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">READ FULL REPORT</a>
            <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
              You received this because you are subscribed to NewsForge Intelligence Hub. 
              <br /><a href="#" style="color: #94a3b8;">Unsubscribe</a>
            </p>
          </div>
        `
      });
    }
    console.log(`Notifications sent to ${emails.length} subscribers.`);
  } catch (err) {
    console.error("Failed to notify subscribers:", err);
  }
};

// III. ASSET RETRIEVAL (BY ID OR SLUG)
articleRouter.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is a UUID (approximate check)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    let query = supabase.from('articles').select('id, title, slug, category, excerpt, image, author, readTime, createdAt, tags, content, markdownContent, status');
    
    if (isUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data: post, error } = await query.maybeSingle();
      
    if (error || !post) return res.status(404).json({ message: "Intelligence node not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

articleRouter.delete("/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE DEBUG] Attempting to purge article ID: ${id}`);
  
  try {
    const { data, error, count } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .select(); // Explicitly select to see what was deleted
    
    if (error) {
       console.error("[DELETE ERROR] Supabase failure:", error);
       throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn(`[DELETE WARNING] No article found with ID: ${id}. Zero rows affected.`);
      return res.status(404).json({ success: false, message: "No node found with that identifier in existing archives." });
    }

    console.log(`[DELETE SUCCESS] Successfully purged article: ${data[0].title} (ID: ${id})`);
    res.json({ success: true, message: "Node purged from high-priority archive", deleted: data[0] });
  } catch (err) {
    console.error("[DELETE CRITICAL] Server logic failure:", err);
    res.status(500).json({ message: "Purge failure: " + err.message });
  }
});

// --- MANUAL ARTICLE SYNTHESIS ---
articleRouter.post("/", adminAuth, async (req, res) => {
  try {
    const { title, category, author, readTime, image, excerpt, content, slug: customSlug, status, tags } = req.body;
    
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
      status: status || 'published',
      tags: Array.isArray(tags) ? tags : [],
      readTime: readTime || 5,
      createdAt: date
    }]);

    if (error) throw error;

    // Trigger Notifications
    const { data: newPost } = await supabase.from('articles').select('*').eq('slug', slug).single();
    if (newPost) notifySubscribers(newPost);

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

// --- ADVANCED ADMIN HUB ---

// 1. Subscriber Management (Enhanced with Search/Filter)
app.get("/api/subscribers", adminAuth, async (req, res) => {
  try {
    const { q, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (q) query = query.ilike('email', `%${q}%`);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data: subs, count, error } = await query.range(offset, offset + limit - 1);
    
    if (error) throw error;
    res.json({ data: subs, total: count });
  } catch (err) {
    res.status(500).json({ message: "Subscription retrieval failure: " + err.message });
  }
});

// 2. Media Library (Metadata-Driven Upgrade)
app.get("/api/media", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: media, count, error } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    res.json({ data: media, total: count });
  } catch (err) {
    res.status(500).json({ message: "Media retrieval failure: " + err.message });
  }
});

app.delete("/api/media/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Resolve asset metadata
    const { data: asset, error: fetchError } = await supabase.from('media_assets').select('file_name').eq('id', id).single();
    if (fetchError || !asset) throw new Error("Asset not found in archive");

    // 2. Clear from Storage
    const { error: storageError } = await supabase.storage.from('images').remove([asset.file_name]);
    if (storageError) throw storageError;

    // 3. Clear from DB
    const { error: dbError } = await supabase.from('media_assets').delete().eq('id', id);
    if (dbError) throw dbError;

    res.json({ success: true, message: "Asset purged from storage and indices" });
  } catch (err) {
    res.status(500).json({ message: "Media deletion failure: " + err.message });
  }
});

// Sync: One-time population tool
app.post("/api/media/sync", adminAuth, async (req, res) => {
  try {
    const { data: files, error } = await supabase.storage.from('images').list();
    if (error) throw error;

    const assets = (files || []).map(file => {
      const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(file.name);
      return {
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_size: file.metadata?.size || 0,
        mime_type: file.metadata?.mimetype || 'image/unknown'
      };
    });

    // Upsert to handle duplicates (by file_name)
    const { error: syncError } = await supabase.from('media_assets').upsert(assets, { onConflict: 'file_name' });
    if (syncError) throw syncError;

    res.json({ success: true, count: assets.length });
  } catch (err) {
    res.status(500).json({ message: "Sync failure: " + err.message });
  }
});

// 4. Admin Analytics & Stats
app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    // parallel fetch for performance
    const [articles, subs, media] = await Promise.all([
      supabase.from('articles').select('views', { count: 'exact' }),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }),
      supabase.from('media_assets').select('*', { count: 'exact', head: true })
    ]);

    const totalViews = (articles.data || []).reduce((acc, curr) => acc + (curr.views || 0), 0);
    
    res.json({
      articles: articles.count || 0,
      subscribers: subs.count || 0,
      media: media.count || 0,
      views: totalViews,
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(500).json({ message: "Analytics retrieval failure: " + err.message });
  }
});

// 3. Article Versioning & Updates
articleRouter.get("/:id/versions", adminAuth, async (req, res) => {
  try {
    const { data: versions, error } = await supabase
      .from('article_versions')
      .select('*')
      .eq('article_id', req.params.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json(versions || []);
  } catch (err) {
    res.status(500).json({ message: "Version retrieval failure: " + err.message });
  }
});

articleRouter.put("/:identifier", adminAuth, async (req, res) => {
  try {
    const { identifier } = req.params;
    const { title, category, author, readTime, image, excerpt, content, status } = req.body;

    // 1. Resolve exact article ID for backend consistency
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    let fetchQuery = supabase.from('articles').select('id, title, content, image');
    
    if (isUuid) {
      fetchQuery = fetchQuery.eq('id', identifier);
    } else {
      fetchQuery = fetchQuery.eq('slug', identifier);
    }

    const { data: current, error: fetchError } = await fetchQuery.maybeSingle();

    if (!fetchError && current) {
      // Create backup in article_versions using the resolved UUID
      await supabase.from('article_versions').insert([{
        article_id: current.id,
        title: current.title,
        content: current.content,
        image: current.image,
        created_at: new Date().toISOString()
      }]);
    }

    // 2. Perform Update (using resolved ID if found, else falling back to identifier)
    const targetId = current?.id || identifier;
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        title,
        category: category || 'Tech',
        content: Array.isArray(content) ? content : null,
        excerpt: excerpt || '',
        image: image || '',
        author: author || 'NewsForge',
        status: status || 'published',
        readTime: readTime || 5,
        updatedAt: new Date().toISOString()
      })
      .eq('id', targetId);

    if (updateError) throw updateError;
    res.json({ success: true, message: "Intelligence node synchronized and backed up" });
  } catch (err) {
    res.status(500).json({ message: "Article update failure: " + err.message });
  }
});

articleRouter.post("/:id/restore", adminAuth, async (req, res) => {
  try {
    const { version_id } = req.body;
    const { data: version, error: vError } = await supabase
      .from('article_versions')
      .select('*')
      .eq('id', version_id)
      .single();

    if (vError || !version) throw new Error("Version node not found");

    const { error: rError } = await supabase
      .from('articles')
      .update({
        title: version.title,
        content: version.content,
        image: version.image,
        updatedAt: new Date().toISOString()
      })
      .eq('id', req.params.id);

    if (rError) throw rError;
    res.json({ success: true, message: "Intelligence node restored to previous state" });
  } catch (err) {
    res.status(500).json({ message: "Version restoration failure: " + err.message });
  }
});

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

// RSS 2.0 Feed
app.get("/feed.xml", async (req, res) => {
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('title,slug,category,excerpt,image,author,createdAt')
      .eq('status', 'published')
      .order('createdAt', { ascending: false })
      .limit(30);

    const domain = FRONTEND_URL;
    const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const catSlug = (c) => (c || 'news').toLowerCase().replace(/\s+/g, '-');

    const items = (articles || []).map(a => `
  <item>
    <title><![CDATA[${a.title}]]></title>
    <link>${domain}/${catSlug(a.category)}/${a.slug}</link>
    <guid isPermaLink="true">${domain}/${catSlug(a.category)}/${a.slug}</guid>
    <description><![CDATA[${a.excerpt || ''}]]></description>
    <author>editorial@newsforge.in (${esc(a.author)})</author>
    <category>${esc(a.category)}</category>
    <pubDate>${new Date(a.createdAt).toUTCString()}</pubDate>
    <enclosure url="${esc(a.image)}" type="image/jpeg" length="0" />
  </item>`).join('');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>NewsForge</title>
    <link>${domain}</link>
    <description>In-depth reporting on tech, finance, and global markets.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${domain}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${domain}/favicon.png</url>
      <title>NewsForge</title>
      <link>${domain}</link>
    </image>
    ${items}
  </channel>
</rss>`;

    res.header("Content-Type", "application/rss+xml; charset=utf-8");
    res.header("Cache-Control", "public, max-age=900");
    res.send(feed);
  } catch (e) {
    res.status(500).send({ message: "Feed generation failed" });
  }
});

// Google News Sitemap
app.get("/news-sitemap.xml", async (req, res) => {
  try {
    // Google News only surfaces articles < 2 days old, but including up to 7 days
    // ensures the sitemap is never empty so Google can validate the format.
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: articles } = await supabase
      .from('articles')
      .select('title,slug,category,createdAt')
      .eq('status', 'published')
      .gte('createdAt', cutoff)
      .order('createdAt', { ascending: false })
      .limit(1000);

    const domain = FRONTEND_URL;
    const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const catSlug = (c) => (c || 'news').toLowerCase().replace(/\s+/g, '-');

    const urls = (articles || []).map(a => `
  <url>
    <loc>${domain}/${catSlug(a.category)}/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>NewsForge</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.createdAt).toISOString()}</news:publication_date>
      <news:title><![CDATA[${a.title}]]></news:title>
    </news:news>
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${urls}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=300");
    res.send(sitemap);
  } catch (e) {
    res.status(500).send({ message: "News sitemap generation failed" });
  }
});

// Trending Topics (proxies Google Trends daily RSS)
app.get("/api/trending-topics", async (req, res) => {
  try {
    const geo = req.query.geo || 'US';
    const { data: xmlText } = await axios.get(
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`,
      { timeout: 6000, headers: { 'Accept': 'application/rss+xml,application/xml' } }
    );

    const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const topics = items.slice(0, 20).map(item => {
      const titleMatch  = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
      const trafficMatch = item.match(/<ht:approx_traffic>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/ht:approx_traffic>/);
      return {
        topic:   titleMatch   ? titleMatch[1].trim()   : null,
        traffic: trafficMatch ? trafficMatch[1].trim() : null,
      };
    }).filter(t => t.topic && t.topic.length > 1);

    res.json(topics);
  } catch (e) {
    console.warn("[TrendingTopics] Google Trends fetch failed:", e.message);
    res.json([]);
  }
});

// --- AI INTELLIGENCE ---
const { parseMarkdownToBlocks } = require('./utils/markdownParser');
const aiOrchestrator = require('./services/aiOrchestrator');

app.post("/api/blogs/generate", adminAuth, async (req, res) => {
  const { topic, category: requestedCategory, provider, depth = 'standard' } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR")) {
    return res.status(403).json({ message: "Intelligence Node Inactive: GEMINI_API_KEY required in .env" });
  }

  if (!topic || topic.trim().length < 3) {
    return res.status(400).json({ message: "No synthesis topic provided" });
  }

  // Setup SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Send an initial ping so client knows connection is open
  res.write(": connected\n\n");

  const topicClean = topic.trim();
  const wordTarget = depth === 'deep' ? '2000-2500' : '1300-1700';
  const sectionTarget = depth === 'deep' ? '7-9' : '5-7';

  try {
    const prompt = `You are a senior journalist and domain expert with 15+ years of hands-on industry experience. Your work appears in leading publications and is trusted by professionals who make real decisions based on it.

Write a substantive, authoritative article that provides GENUINE value — not a surface-level overview, but the kind of insight readers bookmark and share.

ASSIGNMENT:
Topic: “${topicClean}”
Category: ${requestedCategory || ‘General’}
Target Length: ${wordTarget} words
${req.body.keywords ? `Focus Keywords: ${req.body.keywords}` : ‘’}
${req.body.keyPoints ? `Key Points to Cover: ${req.body.keyPoints}` : ‘’}

━━━ CONTENT REQUIREMENTS ━━━

OPENING (Non-negotiable):
- First sentence must be a specific surprising statistic, counterintuitive finding, or bold expert claim
- Do NOT open with “In today’s...”, with the topic word itself, or with “I”
- Readers must feel compelled to keep reading after the first sentence

EXPERT AUTHORITY (All required):
- Include AT LEAST 5 specific numbers, statistics, or percentages throughout the article
- Reference real companies, products, studies, or events by exact name
- Write as someone with direct experience, not someone summarising textbooks
- Include at least one counterintuitive insight that contradicts common assumptions
- If covering a technical topic, show technical depth with specific terminology used correctly

STRUCTURE (Exactly ${sectionTarget} H2 sections):
- H2 titles must be specific and compelling — NOT generic (e.g. “Why 83% of Engineers Ignore This Risk” not “Challenges and Limitations”)
- 2-4 paragraphs per section with concrete examples and real-world context
- Use bullet or numbered lists only where they genuinely add clarity (not to pad length)
- Include ONE comparison table if it would help (use | pipe-separated Markdown format)
- “Key Takeaways” as the second-to-last H2: 5-7 tight, actionable bullet points
- “Frequently Asked Questions” as the last H2: exactly 4 Q&A pairs targeting real search queries
  Format: **Q: [question]** then A: [2-3 sentence answer with a specific fact]
- Final closing section must have a forward-looking title (NOT “Conclusion” or “Final Thoughts”)
  End with a specific call to action or prediction, not a vague summary

━━━ BANNED PHRASES — AUTOMATIC FAIL ━━━
Never write: in today’s world, in today’s digital age, the rise of, the ever-evolving landscape, unlock/unlocking, game-changer/game-changing, dive into/delve into, leverage (as a verb), seamlessly, navigate (metaphorically), it’s crucial, it’s worth noting, needless to say, it’s important to note, moving forward, in conclusion, at the end of the day, this article will, in this article, comprehensive guide, deep dive, paradigm shift, cutting-edge, state-of-the-art, robust (for software), scalable (non-technical use), synergy, holistic approach, streamline, empower, innovative solution, best practices, thought leadership, value proposition, actionable insights, low-hanging fruit, it has been found that, it has been shown

━━━ TONE & STYLE ━━━
- Write with confident authority — assert, don’t hedge
- Use specific numbers: “73% of teams” not “many teams”
- Short punchy sentences after complex ones (control rhythm)
- Vary paragraph length: mix 1-sentence and 4-sentence paragraphs
- Active voice throughout — passive voice is a red flag
- Never imply you are an AI or that this is generated content

━━━ SEO ━━━
- Title: specific, keyword-rich, creates genuine curiosity, max 65 characters
- Meta description: exactly 150-160 characters, includes primary keyword, states the clear benefit
- Use primary keyword naturally in the opening paragraph
- Use semantic variations throughout — never repeat the exact keyword phrase more than 3 times

━━━ IMAGE SEARCH QUERY ━━━
image_search_query: 2-3 CONCRETE, LITERAL keywords a photographer would search to find this image
GOOD examples: “solar panels rooftop”, “server room cables”, “stock chart monitor”, “warehouse robot”
BAD examples: “digital transformation”, “AI revolution concept”, “future of finance”, “technology innovation”

━━━ OUTPUT FORMAT — STRICT JSON ONLY ━━━
Return ONLY a valid JSON object. No markdown code fences. No explanation. Nothing before or after the JSON.
CRITICAL: You MUST escape ALL newlines as \\n inside every string value. Raw line breaks inside strings will break the parser.

{
  “title”: “Specific title under 65 characters”,
  “meta_description”: “Exactly 150-160 character meta description with keyword and clear value”,
  “content”: “Full article in Markdown. Use ## for H2 headers, ### for H3, - for bullet lists, **bold** for key terms, | pipes for tables. Separate ALL blocks with \\n\\n.”,
  “image_search_query”: “2-3 concrete literal stock photo keywords”,
  “image_prompt”: “Detailed realistic photograph description for fallback AI image generation”,
  “tags”: [“tag-one”, “tag-two”, “tag-three”, “tag-four”, “tag-five”]
}`;

    const updateStatus = (msg) => {
      res.write(`data: ${JSON.stringify({ status: msg })}\n\n`);
    };

    const orchestratorResult = await aiOrchestrator.generateContent(prompt, updateStatus, provider);
    
    // If complete failure, still send the fail-safe back to the frontend gracefully
    const { title, content, image_prompt, image_search_query, tags } = orchestratorResult.data;

    const date = new Date().toISOString();
    const dateShort = date.split("T")[0];
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

    updateStatus("Fetching cover image...");
    const stockQuery = image_search_query || topicClean;
    const dynamicImage = await fetchStockImage(stockQuery, requestedCategory);

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(3, Math.ceil(wordCount / 200));
    const articleTags = Array.isArray(tags) && tags.length > 0 ? tags : [];

    // Compose full markdown with YAML frontmatter for storage
    const safeTitle = title.replace(/"/g, "'");
    const safeImagePrompt = (image_prompt || "").replace(/"/g, "'");
    const finalMarkdown = `---
title: "${safeTitle}"
date: "${dateShort}"
category: "${requestedCategory || "Intelligence"}"
readTime: "${readTime} min"
image: "${dynamicImage}"
author: "NewsForge Editorial"
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
      content: parseMarkdownToBlocks(content),
      excerpt,
      image: dynamicImage,
      author: "NewsForge Editorial",
      status: "published",
      readTime,
      tags: articleTags,
      createdAt: date
    }]);

    if (error) throw error;

    // Trigger Notifications
    const { data: newPost } = await supabase.from('articles').select('*').eq('slug', slug).single();
    if (newPost) notifySubscribers(newPost);

    updateStatus("Synthesis complete.");
    res.write(`data: ${JSON.stringify({
      done: true,
      success: orchestratorResult.success,
      message: orchestratorResult.success ? "Article synthesized and published" : "Fail-Safe article published",
      slug,
      title,
      author: "NewsForge Editorial",
      image_prompt,
      provider: orchestratorResult.provider || 'none'
    })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Synthesis Endpoint Failure:", error);
    res.write(`data: ${JSON.stringify({ error: "Intelligence Synthesis Failed: " + error.message })}\n\n`);
    res.end();
  }
});

// File Upload to Supabase Storage + Media Meta Sync
app.post("/api/upload", adminAuth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  
  try {
     const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '').split('.')[0];
     const fileName = `${Date.now()}-${safeName}.webp`;
     
     // 1. Process and Compress Image
     const compressedBuffer = await sharp(req.file.buffer)
       .webp({ quality: 80, effort: 6 })
       .resize({ width: 1200, withoutEnlargement: true }) // Prevent extremely large dimensions
       .toBuffer();

     // 2. Upload to Storage
     const { data: storageData, error: storageError } = await supabase.storage
       .from('images')
       .upload(fileName, compressedBuffer, {
          contentType: 'image/webp'
       });
       
     if (storageError) throw storageError;

     const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
     const publicUrl = publicUrlData.publicUrl;

     // 2. Store Metadata for indexing
     const { error: dbError } = await supabase.from('media_assets').insert([{
        file_name: fileName,
        file_url: publicUrl,
        file_size: req.file.size,
        mime_type: req.file.mimetype
     }]);

     if (dbError) {
        // Cleanup storage if DB fails
        await supabase.storage.from('images').remove([fileName]);
        throw dbError;
     }
     
     res.json({ url: publicUrl });
  } catch (error) {
     console.error("Storage Upload Failure:", error);
     res.status(500).json({ message: "Storage Upload Failed: " + error.message });
  }
});

// --- CONTACT FORM ---
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address." });
    }

    if (resend) {
      await resend.emails.send({
        from: 'NewsForge Contact <onboarding@resend.dev>',
        to: 'contact@newsforge.in',
        reply_to: email,
        subject: `Contact Form: ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="margin-bottom: 4px;">New Contact Message</h2>
            <p style="color: #666; margin-bottom: 24px; font-size: 13px;">Submitted via newsforge.in/contact</p>
            <table style="width:100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #888; width: 80px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            </table>
            <div style="margin-top: 20px; padding: 16px; background: #f9f9f9; border-radius: 6px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>
        `
      });
    }

    res.json({ success: true, message: "Message received." });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

// --- GLOBAL CATCH-ALL & DEBUGGER ---
app.use((req, res) => {
  console.log(`[404 DEBUG] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Intelligence endpoint not found" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
