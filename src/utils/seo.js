/**
 * NEWSFORGE SEO UTILITY v1.0
 * Handles dynamic metadata, document titles, and JSON-LD structured data.
 */

export const DEFAULT_SEO = {
  title: "NewsForge | Intelligence Hub",
  description: "High-density technical analysis and global market intelligence for modern architects of industry.",
  image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072", // Default Hero Image
  keywords: "technical news, global markets, finance analysis, tech trends, industrial intelligence",
  type: "website"
};

export const updateSEOMetadata = (options = {}) => {
  const { title, description, image, keywords, type, url } = { ...DEFAULT_SEO, ...options };

  // 1. Update Document Title
  document.title = title.includes("NewsForge") ? title : `${title} | NewsForge`;

  // 2. Helper to set/update meta tags
  const setMeta = (attr, value, content) => {
    if (!content) return;
    const selector = `meta[${attr}="${value}"]`;
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, value);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Standard Meta
  setMeta('name', 'description', description);
  setMeta('name', 'keywords', keywords);

  // OpenGraph (Facebook/LinkedIn)
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:image', image);
  setMeta('property', 'og:url', url || window.location.href);
  setMeta('property', 'og:type', type);

  // Twitter
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);
};

export const injectArticleJSONLD = (article) => {
  if (!article) return;

  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [article.image],
    "datePublished": article.createdAt,
    "dateModified": article.updatedAt || article.createdAt,
    "author": [{
      "@type": "Person",
      "name": article.author || "NewsForge Analyst",
      "url": window.location.origin
    }],
    "publisher": {
      "@type": "Organization",
      "name": "NewsForge",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/favicon.svg`
      }
    },
    "description": article.excerpt || article.title
  };

  // Cleanup existing JSON-LD to prevent duplication
  const existing = document.getElementById('json-ld-article');
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = 'json-ld-article';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(jsonLD);
  document.head.appendChild(script);
};
