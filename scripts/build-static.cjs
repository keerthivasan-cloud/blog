const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// --- PATHS ---
const CONTENT_DIR = path.join(__dirname, '../backend/content');
const OUTPUT_DIR = path.join(__dirname, '../public/blogs');
const TEMPLATE_PATH = path.join(__dirname, 'static-template.html');

console.log('🚀 INITIALIZING STATIC INTELLIGENCE BUILD...');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// --- SEO GENERATION (Mirrored from MarkdownEngine) ---
function generateSEO(data, content) {
    const title = (data.title || 'Nexus Intelligence Card').slice(0, 60);
    
    const firstParagraph = content.split('\n\n').find(p => p.trim().length > 10) || '';
    const cleanDescription = firstParagraph
      .replace(/[#*`\[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 155);

    const words = content.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
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

// --- BUILD CORE ---
const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

files.forEach(file => {
    try {
        const filePath = path.join(CONTENT_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        const slug = path.basename(file, '.md');
        const htmlContent = marked(content);
        const seo = generateSEO(data, content);
        
        // --- INJECTION ---
        let outputHtml = template
            .replace(/{{TITLE}}/g, (data.title || 'Untitled').toUpperCase())
            .replace(/{{DESCRIPTION}}/g, seo.description)
            .replace(/{{KEYWORDS}}/g, seo.keywords)
            .replace(/{{OG_IMAGE}}/g, seo.ogImage)
            .replace(/{{IMAGE}}/g, data.image || '')
            .replace(/{{CATEGORY}}/g, (data.category || 'GENERAL').toUpperCase())
            .replace(/{{DATE}}/g, data.date || new Date().toLocaleDateString())
            .replace(/{{CONTENT}}/g, htmlContent);

        const outputPath = path.join(OUTPUT_DIR, `${slug}.html`);
        fs.writeFileSync(outputPath, outputHtml);
        
        console.log(`✅ [NODE COMPILATION] Published: /blogs/${slug}.html`);
    } catch (err) {
        console.error(`❌ [BUILD FAILURE] Node: ${file}`, err.message);
    }
});

console.log('✨ STATIC INTELLIGENCE PROTOCOL COMPLETE.');
