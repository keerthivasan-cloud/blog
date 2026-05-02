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
const curatedBases = [
  "1451187580242-4f769806037e", // Modern office / Laptop
  "1518770665346-f8c7981fb5a6", // Circuit board / High-tech
  "1504384308090-c894fdcc538d", // Coding / Developer
  "1519389950473-47ba0277781c", // Team / Business meeting
  "1460925895917-afdab827c52f", // Dashboard / Growth
  "1526628953301-3e589a6a8b74", // Abstract futuristic
  "1550751827-4bd374c3f58b", // Cyber security
  "1485827404703-89b55fcc595e", // AI / Robotics
  "1531297484001-80022131f5a1", // Server room
  "1551288049-bebda4e38f71"  // Data visualization
];

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
      "img-src": ["'self'", "data:", "blob:", "https://*.supabase.co", "https://image.pollinations.ai", "https://images.unsplash.com", "https://images.pexels.com"],
      "connect-src": ["'self'", "https://*.supabase.co", "https://api.pollinations.ai"]
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
  const wordTarget = depth === 'deep' ? '1500-2000' : '800-1200';
  const sectionTarget = depth === 'deep' ? '8-10' : '4-6';

  try {
    const prompt = `You are a professional SEO blog writer.

Write a high-quality, human-like blog article.

INPUT:
Topic: "${topicClean}"
${req.body.keywords ? `CONTEXT:\\n- Topic keywords: ${req.body.keywords}` : ''}
${req.body.keyPoints ? `\\n- Key points: ${req.body.keyPoints}` : ''}

REQUIREMENTS:
- Length: 900–1200 words
- Tone: clear, authoritative, natural (NOT robotic)
- Audience: general readers

STRUCTURE:
1. Hook introduction (engaging, 2–3 paragraphs)
2. Clear H2 sections (5–7 sections)
3. Each section must:
   - explain concept properly
   - include examples or real-world context
4. Add bullet points where useful
5. Add one comparison table if relevant
6. Add a short conclusion

STRICT RULES:
- No fluff
- No repetition
- No generic statements like “in today’s world”
- No AI-style phrases
- Content must directly match the topic (no drifting)

SEO:
- Naturally include keywords related to the topic
- Add a compelling title
- Add meta description (150–160 chars)

IMAGE PROMPT RULES:
Create a realistic, high-quality blog illustration.
Topic: "${topicClean}"
Style:
- modern, clean
- realistic (NOT cartoon unless topic needs)
- minimal text
- suitable for blog header

Avoid:
- random elements
- unrelated visuals
- over-stylized AI look

QUALITY CONTROL:
Check this article for:
- relevance to topic
- clarity
- repetition
- useless content

Return:
- issues
- improved version if needed. (Your final output inside 'content' must be the improved version)

OUTPUT FORMAT — STRICT:
Return ONLY a valid JSON object. No markdown. No backticks. No explanation. Nothing before or after the JSON.
CRITICAL JSON RULE: You MUST escape all newlines as \\n inside the string values. DO NOT output raw line breaks inside the "content" string.

{
  "title": "Your compelling, topic-specific title",
  "meta_description": "Your 150-160 character meta description",
  "content": "Full improved article. You MUST use \\n\\n to separate all elements. Note: Provide the text using standard Markdown formatting (e.g., ## for H2, - for bullets) so it seamlessly integrates with our markdown parser.",
  "image_prompt": "Your realistic, high-quality blog illustration image prompt",
  "qc_issues": "Brief summary of quality control issues found and fixed"
}`;

    const updateStatus = (msg) => {
      res.write(`data: ${JSON.stringify({ status: msg })}\n\n`);
    };

    const orchestratorResult = await aiOrchestrator.generateContent(prompt, updateStatus, provider);
    
    // If complete failure, still send the fail-safe back to the frontend gracefully
    const { title, content, image_prompt } = orchestratorResult.data;

    const date = new Date().toISOString();
    const dateShort = date.split("T")[0];
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

    // Dynamically generate an image using the exact topic/image prompt
    const imageQuery = image_prompt || topicClean;
    const dynamicImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(imageQuery)}?width=1200&height=800&nologo=true`;

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
      content: parseMarkdownToBlocks(content),
      excerpt,
      image: dynamicImage,
      author: orchestratorResult.success ? "NewsForge AI" : "System Fail-Safe",
      status: "published",
      readTime: 5,
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
      message: orchestratorResult.success ? "Intelligence node synthesized and published" : "Fail-Safe node published",
      slug,
      title,
      author: orchestratorResult.success ? "NewsForge AI" : "System Fail-Safe",
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
