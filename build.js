// c:\Users\NAK\coding code - badhan\build.js
/**
 * Northstar Studio Reorganized Site Compiler
 * Compiles pages, dynamic case studies, dynamic blog articles, sitemaps, and robots.txt.
 * Places HTML files under categorized directories (/pages/, /pages/blog/, /pages/projects/, etc.),
 * and copies static source assets from src/assets/ to assets/.
 * Automatically calculates relative depth path prefixes for layout variable substitutions.
 * Automatically rewrites relative links in body contents to match the new nested folder paths.
 */

const fs = require('fs');
const path = require('path');

// Load database arrays
const projects = require('./src/data/projects.js');
const blog = require('./src/data/blog.js');

// Source paths
const TEMPLATES_DIR = path.join(__dirname, 'src/templates');
const PAGES_DIR = path.join(__dirname, 'src/pages');
const SRC_ASSETS_DIR = path.join(__dirname, 'src/assets');
const DIST_DIR = __dirname; // Root workspace directory

// Reorganized categories routing table
const dirFallbackMap = {
  'index.html': '',
  
  // Blog
  'blog.html': 'pages/blog',
  
  // Projects
  'projects.html': 'pages/projects',
  'project-details.html': 'pages/projects',
  
  // Legal
  'privacy.html': 'pages/legal',
  'terms.html': 'pages/legal',
  'cookie-policy.html': 'pages/legal',
  'accessibility.html': 'pages/legal',
  'licenses.html': 'pages/legal',
  
  // Resources
  'resources.html': 'pages/resources',
  'documentation.html': 'pages/resources',
  'downloads.html': 'pages/resources',
  'certifications.html': 'pages/resources',
  'open-source.html': 'pages/resources',
  'clients.html': 'pages/resources',
  'media-kit.html': 'pages/resources',
  'press.html': 'pages/resources',
  'style-guide.html': 'pages/resources',
  'design-system.html': 'pages/resources',
  'components.html': 'pages/resources',
  'ui-showcase.html': 'pages/resources',
  'animations.html': 'pages/resources',
  'roadmap.html': 'pages/resources',
  'api-docs.html': 'pages/resources',
  'developer-notes.html': 'pages/resources',
  'toolkit.html': 'pages/resources',
  'career.html': 'pages/resources',
  'newsletter.html': 'pages/resources',
  
  // Defaults (all others compile to pages/)
};

// Map of old root filename links to their new reorganized target locations
const pathRewriteMap = {
  'index.html': 'index.html',
  'about.html': 'pages/about.html',
  'services.html': 'pages/services.html',
  'skills.html': 'pages/skills.html',
  'resume.html': 'pages/resume.html',
  'contact.html': 'pages/contact.html',
  'faq.html': 'pages/faq.html',
  'pricing.html': 'pages/pricing.html',
  'process.html': 'pages/process.html',
  'testimonials.html': 'pages/testimonials.html',
  'case-studies.html': 'pages/case-studies.html',
  'gallery.html': 'pages/gallery.html',
  'experience.html': 'pages/experience.html',
  'education.html': 'pages/education.html',
  'sitemap.html': 'pages/sitemap.html',
  'search.html': 'pages/search.html',
  'coming-soon.html': 'pages/coming-soon.html',
  'changelog.html': 'pages/changelog.html',
  'support.html': 'pages/support.html',
  'thank-you.html': 'pages/thank-you.html',
  '404.html': 'pages/404.html',
  '500.html': 'pages/500.html',
  'maintenance.html': 'pages/maintenance.html',
  
  // Blog
  'blog.html': 'pages/blog/blog.html',
  
  // Projects
  'projects.html': 'pages/projects/projects.html',
  'project-details.html': 'pages/projects/project-details.html',
  
  // Legal
  'privacy.html': 'pages/legal/privacy.html',
  'terms.html': 'pages/legal/terms.html',
  'cookie-policy.html': 'pages/legal/cookie-policy.html',
  'accessibility.html': 'pages/legal/accessibility.html',
  'licenses.html': 'pages/legal/licenses.html',
  
  // Resources
  'resources.html': 'pages/resources/resources.html',
  'documentation.html': 'pages/resources/documentation.html',
  'downloads.html': 'pages/resources/downloads.html',
  'certifications.html': 'pages/resources/certifications.html',
  'open-source.html': 'pages/resources/open-source.html',
  'clients.html': 'pages/resources/clients.html',
  'media-kit.html': 'pages/resources/media-kit.html',
  'press.html': 'pages/resources/press.html',
  'style-guide.html': 'pages/resources/style-guide.html',
  'design-system.html': 'pages/resources/design-system.html',
  'components.html': 'pages/resources/components.html',
  'ui-showcase.html': 'pages/resources/ui-showcase.html',
  'animations.html': 'pages/resources/animations.html',
  'roadmap.html': 'pages/resources/roadmap.html',
  'api-docs.html': 'pages/resources/api-docs.html',
  'developer-notes.html': 'pages/resources/developer-notes.html',
  'toolkit.html': 'pages/resources/toolkit.html',
  'career.html': 'pages/resources/career.html',
  'newsletter.html': 'pages/resources/newsletter.html',
};

// Helper: Ensure directory exists recursively
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

// Helper: Copy directory content recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper: Compute Path Prefix
const getPathPrefix = (dir) => {
  if (!dir) return '';
  const depth = dir.split('/').filter(Boolean).length;
  return '../'.repeat(depth);
};

// Link Rewriting Helper: scans body HTML strings and maps old paths to new directories
function rewriteBodyLinks(bodyHtml, currentDir) {
  const pathPrefix = getPathPrefix(currentDir);
  
  // 1. Rewrite anchor hrefs
  let result = bodyHtml.replace(/(<a\s+[^>]*href=["'])([^"']*)(["'])/gi, (match, p1, p2, p3) => {
    let href = p2;
    
    // Skip absolute links, anchors, protocols, javascript triggers
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#') ||
      href.startsWith('javascript:')
    ) {
      return match;
    }

    // Strip hash anchors
    const parts = href.split('#');
    const filename = parts[0];
    const hash = parts[1] ? `#${parts[1]}` : '';

    if (!filename) return match;

    let targetPath = null;

    // Check project-details matches
    const projectMatch = filename.match(/^project-details-(\d+)\.html$/);
    if (projectMatch) {
      targetPath = `pages/projects/project-details-${projectMatch[1]}.html`;
    }

    // Check blog matches
    const blogMatch = filename.match(/^blog-(\d+)\.html$/);
    if (blogMatch) {
      targetPath = `pages/blog/blog-${blogMatch[1]}.html`;
    }

    // Check generic routing map
    if (!targetPath && pathRewriteMap[filename]) {
      targetPath = pathRewriteMap[filename];
    }

    if (targetPath) {
      const resolvedHref = `${pathPrefix}${targetPath}${hash}`;
      return `${p1}${resolvedHref}${p3}`;
    }

    return match;
  });

  // 2. Rewrite image sources (convert images/path to assets/images/path)
  result = result.replace(/(<img\s+[^>]*src=["'])(images\/[^"']*)(["'])/gi, (match, p1, p2, p3) => {
    const srcPath = p2; // e.g. "images/project-placeholder.svg"
    const resolvedSrc = `${pathPrefix}assets/${srcPath}`;
    return `${p1}${resolvedSrc}${p3}`;
  });

  return result;
}

function build() {
  console.log('Starting site reorganization compilation pipeline...');

  // 1. Copy static assets from src/assets/ to assets/
  console.log('Copying static assets into assets/ directory...');
  fs.mkdirSync(path.join(DIST_DIR, 'assets/css'), { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'assets/js'), { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'assets/images'), { recursive: true });

  // Copy style.css
  const srcCss = path.join(SRC_ASSETS_DIR, 'css/style.css');
  if (fs.existsSync(srcCss)) {
    fs.copyFileSync(srcCss, path.join(DIST_DIR, 'assets/css/style.css'));
  }
  // Copy script.js
  const srcJs = path.join(SRC_ASSETS_DIR, 'js/script.js');
  if (fs.existsSync(srcJs)) {
    fs.copyFileSync(srcJs, path.join(DIST_DIR, 'assets/js/script.js'));
  }
  // Copy images
  const srcImagesDir = path.join(SRC_ASSETS_DIR, 'images');
  if (fs.existsSync(srcImagesDir)) {
    copyDirSync(srcImagesDir, path.join(DIST_DIR, 'assets/images'));
  }

  // 2. Load layout template
  const layoutPath = path.join(TEMPLATES_DIR, 'layout.html');
  if (!fs.existsSync(layoutPath)) {
    console.error('CRITICAL ERROR: layout.html layout wrapper is missing!');
    process.exit(1);
  }
  const layout = fs.readFileSync(layoutPath, 'utf8');

  // Track compiled files for sitemap generation
  const compiledFiles = [];

  // Helper: Replace template placeholders in a string
  const compilePage = (template, replacements) => {
    let result = template;
    Object.entries(replacements).forEach(([key, val]) => {
      result = result.split(`{{${key}}}`).join(val);
    });
    return result;
  };

  // Helper: Parse frontmatter-like JSON comments at top of file
  const parsePageContent = (fileContent) => {
    const metaRegex = /^<!--\{([\s\S]*?)\}-->/;
    const match = fileContent.match(metaRegex);
    let meta = {};
    let body = fileContent;

    if (match) {
      try {
        meta = JSON.parse('{' + match[1] + '}');
        body = fileContent.replace(metaRegex, '').trim();
      } catch (err) {
        console.error('JSON parsing failed on file metadata header block:', err);
      }
    }
    return { meta, body };
  };

  // 3. Compile Core 50 HTML Pages from src/pages/
  const pageFiles = fs.readdirSync(PAGES_DIR).filter(file => file.endsWith('.html'));

  pageFiles.forEach(file => {
    const filePath = path.join(PAGES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { meta, body } = parsePageContent(content);

    // Resolve directory
    const dir = meta.dir !== undefined ? meta.dir : (dirFallbackMap[file] !== undefined ? dirFallbackMap[file] : 'pages');
    const pathPrefix = getPathPrefix(dir);

    // Rewrite body links to support nesting
    let finalBody = rewriteBodyLinks(body, dir);

    // Special injection for Blog Hub: render the list of 20 posts statically
    if (file === 'blog.html') {
      const blogPostsHtml = blog.map(post => {
        const plainTextSnippet = post.body
          .replace(/<[^>]*>/g, '')
          .replace(/MANDATORY DISCLAIMER:[\s\S]*?\./, '')
          .trim()
          .slice(0, 150) + '...';

        return `
        <article class="card blog-card blog-card-article reveal" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <span class="project-badge">${post.category}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${post.date}</span>
            </div>
            <h3>${post.title}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; line-height: 1.5;">${plainTextSnippet}</p>
          </div>
          <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">By ${post.author}</span>
            <a href="${pathPrefix}pages/blog/blog-${post.id}.html" class="btn btn-secondary btn-sm">Read Post</a>
          </div>
        </article>
        `;
      }).join('\n');

      finalBody = finalBody.replace('{{blog_posts}}', blogPostsHtml);
    }

    const pageRelativePath = dir ? `${dir}/${file}` : file;

    const pageVariables = {
      title: meta.title || 'Northstar Studio | Portfolio',
      description: meta.description || 'Fictional portfolio website layout.',
      canonical: `https://northstar.example.com/${pageRelativePath}`,
      og_image: 'assets/images/project-placeholder.svg',
      path_prefix: pathPrefix,
      content: finalBody
    };

    const compiledHtml = compilePage(layout, pageVariables);
    const outputFilePath = path.join(DIST_DIR, pageRelativePath);
    ensureDirectoryExistence(outputFilePath);
    fs.writeFileSync(outputFilePath, compiledHtml, 'utf8');
    
    compiledFiles.push(pageRelativePath);
    console.log(`Compiled page: ${pageRelativePath}`);
  });

  // 4. Compile 12 Project Details Pages
  projects.forEach(project => {
    const dir = 'pages/projects';
    const filename = `project-details-${project.id}.html`;
    const pathPrefix = getPathPrefix(dir);
    const pageRelativePath = `${dir}/${filename}`;
    
    const rawBodyContent = `
    <section class="hero" style="padding-bottom: 2rem;">
      <div class="container">
        <div class="breadcrumbs" aria-label="Breadcrumb navigation">
          <a href="index.html">Home</a> <span class="separator">/</span>
          <a href="projects.html">Projects</a> <span class="separator">/</span>
          <span class="current" aria-current="page">${project.title}</span>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top: 0;">
      <div class="container project-details-grid">
        
        <!-- Detailed Case study Content -->
        <div class="reveal">
          <p class="eyebrow">${project.category} — Fictional Case Study</p>
          <h1 style="font-family: var(--font-heading); font-size: clamp(2.25rem, 5vw, 3.25rem); font-weight: 800; line-height: 1.15; margin-bottom: 1.5rem; background: linear-gradient(135deg, #ffffff 40%, #a1a1aa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${project.title}</h1>
          <p style="font-size: 1.15rem; color: var(--text-muted); margin-bottom: 2.5rem; line-height: 1.6;">${project.description}</p>
          
          <div class="hero-card" style="margin-bottom: 3.5rem;">
            <img src="${pathPrefix}assets/${project.coverImage}" alt="${project.title} Mockup cover preview display" style="width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 3rem;">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 1.65rem; margin-bottom: 0.75rem; color: #ffffff;">Project Overview</h2>
              <p style="color: var(--text-muted); line-height: 1.75;">${project.overview}</p>
            </div>

            <div>
              <h2 style="font-family: var(--font-heading); font-size: 1.65rem; margin-bottom: 0.75rem; color: #ffffff;">The Challenge</h2>
              <p style="color: var(--text-muted); line-height: 1.75;">${project.challenges}</p>
            </div>

            <div>
              <h2 style="font-family: var(--font-heading); font-size: 1.65rem; margin-bottom: 0.75rem; color: #ffffff;">The Solution</h2>
              <p style="color: var(--text-muted); line-height: 1.75;">${project.solution}</p>
            </div>

            <div>
              <h2 style="font-family: var(--font-heading); font-size: 1.65rem; margin-bottom: 0.75rem; color: #ffffff;">Mock Results & Metrics</h2>
              <p style="color: var(--text-muted); line-height: 1.75;">${project.results}</p>
            </div>

            <!-- Project Screenshot gallery -->
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 1.65rem; margin-bottom: 1.25rem; color: #ffffff;">Project Gallery</h2>
              <div class="grid-3">
                ${project.gallery.map((img, i) => `
                  <div class="card" style="padding: 0.5rem; cursor: pointer;" onclick="openGalleryModal('${pathPrefix}assets/${img}', '${project.title} Gallery Slot ${i+1}')">
                    <img src="${pathPrefix}assets/${img}" alt="${project.title} screenshot illustration ${i+1}" style="width: 100%;" />
                  </div>
                `).join('\n')}
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Panel -->
        <div class="project-snapshot-panel reveal">
          <h3 class="project-snapshot-title">Project Snapshot</h3>
          <ul class="snapshot-meta-list" style="margin-bottom: 2rem;">
            <li class="snapshot-meta-item">
              <strong>Category Focus</strong>
              <span>${project.category}</span>
            </li>
            <li class="snapshot-meta-item">
              <strong>Technologies Stack</strong>
              <div class="tech-badges" style="margin-top: 0.4rem;">
                ${project.technologies.map(t => `<span>${t}</span>`).join('')}
              </div>
            </li>
            <li class="snapshot-meta-item">
              <strong>Client Profile</strong>
              <span>Example Studio (Mock)</span>
            </li>
            <li class="snapshot-meta-item">
              <strong>Status Log</strong>
              <span>Demo Simulation</span>
            </li>
          </ul>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <a href="${project.liveDemo}" target="_blank" rel="noopener" class="btn btn-primary" style="width: 100%;">Live Demo (Mock)</a>
            <a href="${project.github}" target="_blank" rel="noopener" class="btn btn-secondary" style="width: 100%;">GitHub Repo (Mock)</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Gallery dialog -->
    <dialog class="search-modal" id="gallery-dialog" style="overflow: hidden;">
      <div class="search-modal-card" style="width: min(700px, 95vw); position: relative; padding: 1.5rem; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
        <button onclick="document.getElementById('gallery-dialog').close()" aria-label="Close image" style="position: absolute; top: 1rem; right: 1rem; font-size: 1.25rem; color: var(--text-color); cursor: pointer; z-index: 10;">✕</button>
        <img id="gallery-dialog-img" src="" alt="Expanded preview illustration" style="width: 100%; border-radius: var(--radius-sm); margin-bottom: 1rem; border: 1px solid var(--border-color);" />
        <h3 id="gallery-dialog-title" style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700;">Expanded Preview</h3>
        <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem;">This represents fictional demonstration artwork.</p>
      </div>
    </dialog>

    <script>
      function openGalleryModal(src, title) {
        const dialog = document.getElementById('gallery-dialog');
        const img = document.getElementById('gallery-dialog-img');
        const titleEl = document.getElementById('gallery-dialog-title');
        if (!dialog || !img) return;

        img.src = src;
        if (titleEl) titleEl.textContent = title;
        dialog.showModal();
      }
    </script>
    `;

    // Rewrite body links to resolve directory references automatically
    const bodyContent = rewriteBodyLinks(rawBodyContent, dir);

    const pageVariables = {
      title: `${project.title} | Case Study`,
      description: project.description,
      canonical: `https://northstar.example.com/${pageRelativePath}`,
      og_image: 'assets/images/project-placeholder.svg',
      path_prefix: pathPrefix,
      content: bodyContent
    };

    const compiledHtml = compilePage(layout, pageVariables);
    const outputFilePath = path.join(DIST_DIR, pageRelativePath);
    ensureDirectoryExistence(outputFilePath);
    fs.writeFileSync(outputFilePath, compiledHtml, 'utf8');

    compiledFiles.push(pageRelativePath);
    console.log(`Compiled Project Details page: ${pageRelativePath}`);
  });

  // 5. Compile 20 Unique Blog Articles Pages
  blog.forEach(post => {
    const dir = 'pages/blog';
    const filename = `blog-${post.id}.html`;
    const pathPrefix = getPathPrefix(dir);
    const pageRelativePath = `${dir}/${filename}`;

    const rawBodyContent = `
    <section class="hero" style="padding-bottom: 2rem;">
      <div class="container" style="max-width: 800px;">
        <div class="breadcrumbs" aria-label="Breadcrumb navigation">
          <a href="index.html">Home</a> <span class="separator">/</span>
          <a href="blog.html">Blog</a> <span class="separator">/</span>
          <span class="current" aria-current="page">${post.title}</span>
        </div>
        
        <p class="eyebrow" style="margin-bottom: 0.85rem; margin-top: 2rem;">${post.category} — Sample Content</p>
        <h1 style="font-family: var(--font-heading); font-size: clamp(2.25rem, 5vw, 3.25rem); line-height: 1.15; margin-bottom: 1.5rem; background: linear-gradient(135deg, #ffffff 40%, #a1a1aa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${post.title}</h1>
        
        <div style="display: flex; gap: 1.5rem; align-items: center; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem;">
          <span>Published: <strong>${post.date}</strong></span>
          <span>Author: <strong>${post.author}</strong></span>
        </div>

        <!-- Table of Contents -->
        <div class="card" style="padding: 1.5rem; margin-bottom: 2.5rem; background: rgba(255, 255, 255, 0.015);">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; margin-bottom: 0.75rem;">Table of Contents</h3>
          <nav style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem;" aria-label="Table of contents menu">
            ${post.toc.map(item => `<a href="${item.link}" style="color: var(--accent-cyan); font-weight: 500;">${item.text}</a>`).join('\n')}
          </nav>
        </div>

        <!-- Article Body -->
        <div class="article-body" style="font-size: 1.05rem; line-height: 1.75; color: #d1d5db; display: flex; flex-direction: column; gap: 1.5rem;">
          ${post.body}
        </div>

        <!-- Related Posts -->
        <div style="border-top: 1px solid var(--border-color); margin-top: 4rem; padding-top: 2.5rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 1.5rem;">Related Articles</h3>
          <div class="grid-2">
            ${post.related.map(relId => {
              const rel = blog.find(b => b.id === relId);
              if (!rel) return '';
              return `
                <a href="blog-${rel.id}.html" class="card" style="display: block; padding: 1.25rem;">
                  <span style="font-size: 0.75rem; color: var(--accent-cyan); text-transform: uppercase; font-weight: 600;">${rel.category}</span>
                  <h4 style="font-family: var(--font-heading); font-size: 1.15rem; margin-top: 0.25rem; font-weight: 700;">${rel.title}</h4>
                </a>
              `;
            }).join('\n')}
          </div>
        </div>
      </div>
    </section>
    `;

    // Rewrite body links dynamically
    const bodyContent = rewriteBodyLinks(rawBodyContent, dir);

    const pageVariables = {
      title: `${post.title} | Blog`,
      description: `Fictional article post detailing ${post.category.toLowerCase()} variables.`,
      canonical: `https://northstar.example.com/${pageRelativePath}`,
      og_image: 'assets/images/project-placeholder.svg',
      path_prefix: pathPrefix,
      content: bodyContent
    };

    const compiledHtml = compilePage(layout, pageVariables);
    const outputFilePath = path.join(DIST_DIR, pageRelativePath);
    ensureDirectoryExistence(outputFilePath);
    fs.writeFileSync(outputFilePath, compiledHtml, 'utf8');

    compiledFiles.push(pageRelativePath);
    console.log(`Compiled Blog Article page: ${pageRelativePath}`);
  });

  // 6. Generate sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${compiledFiles.map(file => `
  <url>
    <loc>https://northstar.example.com/${file}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${file === 'index.html' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml.trim(), 'utf8');
  console.log('Compiled sitemap.xml successfully!');

  // 7. Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://northstar.example.com/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt.trim(), 'utf8');
  console.log('Compiled robots.txt successfully!');

  console.log('Compilation pipeline completed successfully! generated ' + compiledFiles.length + ' pages.');
}

build();
