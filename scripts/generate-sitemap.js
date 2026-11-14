const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Current UTC timestamp in ISO 8601
const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

// All 8 canonical navigation routes requested in TASK 1.1 & TASK 2.1
const canonicalUrls = [
  { loc: 'https://play2048online.site/', priority: '1.0', changefreq: 'daily' },
  { loc: 'https://play2048online.site/leaderboard', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://play2048online.site/about', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://play2048online.site/how-to-play', priority: '0.8', changefreq: 'weekly' },
  { loc: 'https://play2048online.site/unblocked', priority: '0.9', changefreq: 'weekly' },
  { loc: 'https://play2048online.site/contact', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://play2048online.site/privacy', priority: '0.5', changefreq: 'yearly' },
  { loc: 'https://play2048online.site/terms', priority: '0.5', changefreq: 'yearly' }
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${canonicalUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const robotsTxt = `# robots.txt for 2048 Online (https://play2048online.site/)
# Optimized for Googlebot, Bingbot, and modern web crawlers
# Compliant with RFC 9309 and Google Search Central specifications

User-agent: *
Allow: /
Allow: /favicon.svg
Allow: /favicon.ico
Allow: /apple-touch-icon.png
Allow: /og-image-2048.png
Disallow: /api/
Disallow: /404.html
Disallow: /500.html

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /404.html
Disallow: /500.html

User-agent: Googlebot-Image
Allow: /
Allow: /favicon.svg
Allow: /favicon.ico
Allow: /apple-touch-icon.png
Allow: /og-image-2048.png
Allow: /icon-*.png

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /404.html
Disallow: /500.html

Host: play2048online.site
Sitemap: https://play2048online.site/sitemap.xml
`;

// Write to both /public and root directory
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapXml, 'utf8');

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
fs.writeFileSync(path.join(rootDir, 'robots.txt'), robotsTxt, 'utf8');

console.log(`Generated /public/sitemap.xml and /public/robots.txt with ${canonicalUrls.length} canonical URLs!`);
