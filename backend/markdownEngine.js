const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const chokidar = require('chokidar');

class MarkdownEngine {
  constructor(contentPath) {
    this.contentPath = contentPath;
    this.posts = new Map();
    this.isReady = false;
    
    // Initialize Watcher
    this.initWatcher();

    // Fallback sync every 30 seconds
    setInterval(() => this.fullSync(), 30000);

    // Dynamic Static Generation Template
    this.templatePath = path.join(__dirname, '../scripts/static-template.html');
    this.outputDir = path.join(__dirname, '../public/blogs');
    this.loadTemplate();
  }

  loadTemplate() {
    try {
      this.staticTemplate = fs.readFileSync(this.templatePath, 'utf8');
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
    } catch (err) {
      console.error('[Static Engine] Template acquisition failure:', err.message);
    }
  }

  generateStaticHtml(post) {
    if (!this.staticTemplate) return;

    try {
      const safeTitle = (post.title || post.slug || 'Untitled').toUpperCase();
      const safeCategory = (post.category || 'Intelligence').toUpperCase();
      
      let html = this.staticTemplate
        .replace(/{{TITLE}}/g, safeTitle)
        .replace(/{{DESCRIPTION}}/g, post.seo?.description || '')
        .replace(/{{KEYWORDS}}/g, post.seo?.keywords || '')
        .replace(/{{OG_IMAGE}}/g, post.seo?.ogImage || post.image || '')
        .replace(/{{IMAGE}}/g, post.image || '')
        .replace(/{{CATEGORY}}/g, safeCategory)
        .replace(/{{DATE}}/g, post.date || new Date().toLocaleDateString())
        .replace(/{{CONTENT}}/g, post.content);

      const outputPath = path.join(this.outputDir, `${post.slug}.html`);
      fs.writeFileSync(outputPath, html);
      console.log(`[Static] Node Compilation: ${post.slug}.html`);
    } catch (err) {
      console.error(`[Static] Compilation Failure: ${post.slug}`, err.message);
    }
  }

  async fullSync() {
    console.log('[Markdown Engine] Performing periodic fail-safe synchronization...');
    try {
      const files = fs.readdirSync(this.contentPath);
      for (const file of files) {
        if (file.endsWith('.md')) {
          await this.syncPost(path.join(this.contentPath, file));
        }
      }
    } catch (err) {
      console.error('[Sync Failure] Global directory scan error:', err.message);
    }
  }

  initWatcher() {
    console.log(`[Markdown Engine] Monitoring protocol active: ${this.contentPath}`);
    
    const watcher = chokidar.watch(this.contentPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    watcher
      .on('add', filePath => this.syncPost(filePath))
      .on('change', filePath => this.syncPost(filePath))
      .on('unlink', filePath => this.removePost(filePath))
      .on('ready', () => {
        this.isReady = true;
        console.log('[Markdown Engine] Initial synchronization complete.');
      });
  }

  generateSEO(data, content) {
    const title = (data.title || 'Nexus Intelligence Card').slice(0, 60);
    
    // Extract first paragraph and strip markdown
    const firstParagraph = (content || '').split('\n\n').find(p => p.trim().length > 10) || '';
    const cleanDescription = firstParagraph
      .replace(/[#*`\[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 155);

    // Extract keywords (unique technical terms)
    const words = (content || '').toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
    const stopWords = new Set(['about', 'before', 'could', 'should', 'would', 'these', 'those']);
    const keywords = [...new Set(words)]
      .filter(w => !stopWords.has(w))
      .slice(0, 8)
      .join(', ');

    return {
      title,
      description: cleanDescription || 'Strategic analysis from the NewsForge global terminal.',
      keywords: keywords || 'finance, tech, intelligence, markets',
      ogImage: data.image || '/og-default.png'
    };
  }

  parseToBlocks(markdown) {
    const blocks = [];
    const lines = markdown.split('\n');
    let currentList = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        if (currentList) {
          blocks.push(currentList);
          currentList = null;
        }
        continue;
      }

      // 1. Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headingMatch) {
        blocks.push({
          type: 'heading',
          level: headingMatch[1].length,
          text: headingMatch[2]
        });
        continue;
      }

      // 2. Blockquotes (Quotes)
      const quoteMatch = line.match(/^>\s+(.*)/);
      if (quoteMatch) {
        blocks.push({
          type: 'quote',
          text: quoteMatch[1]
        });
        continue;
      }

      // 3. Lists (Bullets)
      const listMatch = line.match(/^[\-\*]\s+(.*)/);
      if (listMatch) {
        if (!currentList) {
          currentList = { type: 'list', items: [] };
        }
        currentList.items.push(listMatch[1]);
        continue;
      }

      // 4. Case-Specific: Highlights (Elite NewsForge specific)
      // Any paragraph starting with "!!" or very short impactful sentences
      if (line.startsWith('!!')) {
        blocks.push({
          type: 'highlight',
          text: line.replace('!!', '').trim()
        });
        continue;
      }

      // 5. Default: Paragraph
      blocks.push({
        type: 'paragraph',
        text: line
      });
    }

    if (currentList) blocks.push(currentList);
    return blocks;
  }

  async syncPost(filePath) {
    if (path.extname(filePath) !== '.md') return;

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      const slug = path.basename(filePath, '.md');
      const htmlContent = marked(content);
      
      // Auto-extract description from first 160 chars if missing
      const description = data.description || content.slice(0, 160).replace(/[#*`]/g, '').trim() + '...';

      const post = {
        title: data.title || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        category: data.category || 'Intelligence',
        image: data.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000',
        ...data,
        slug,
        content: htmlContent,
        blocks: this.parseToBlocks(content),
        description,
        excerpt: description,
        createdAt: data.date ? new Date(data.date) : new Date(),
        status: 'published',
        seo: this.generateSEO(data, content)
      };

      this.posts.set(slug, post);
      
      // TRIGGER REACTIVE STATIC GENERATION
      this.generateStaticHtml(post);
      
      console.log(`[Sync] Intelligence node updated: ${slug}`);
    } catch (err) {
      console.error(`[Sync Failure] Node: ${filePath}`, err.message);
    }
  }

  removePost(filePath) {
    const slug = path.basename(filePath, '.md');
    this.posts.delete(slug);
    
    // Cleanup Static Node
    try {
      const staticPath = path.join(this.outputDir, `${slug}.html`);
      if (fs.existsSync(staticPath)) {
        fs.unlinkSync(staticPath);
        console.log(`[Static] Node unlinked: ${slug}.html`);
      }
    } catch (err) {
      console.error(`[Static] De-indexing failure: ${slug}`, err.message);
    }
    
    console.log(`[Purge] Intelligence node de-indexed: ${slug}`);
  }

  getPosts() {
    return Array.from(this.posts.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  getPostBySlug(slug) {
    return this.posts.get(slug);
  }

  getTrendingTags() {
    const tagFreq = new Map();
    this.getPosts().forEach(post => {
      // Prioritize explicit tags, fallback to synthesized keywords
      const tags = post.tags || post.seo.keywords.split(',').map(s => s.trim());
      tags.forEach(tag => {
        if (!tag) return;
        const normalized = tag.toLowerCase();
        // Ignore generic/short tags
        if (normalized.length < 3) return;
        tagFreq.set(normalized, (tagFreq.get(normalized) || 0) + 1);
      });
    });

    return Array.from(tagFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => ({ name: entry[0], count: entry[1] }));
  }

  searchPosts(query) {
    const q = query.toLowerCase();
    return this.getPosts().filter(post => 
      post.title.toLowerCase().includes(q) || 
      post.category.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q)
    );
  }
}

// Singleton Instance
const engine = new MarkdownEngine(path.join(__dirname, 'content'));

module.exports = engine;
