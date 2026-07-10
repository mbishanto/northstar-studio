// c:\Users\NAK\coding code - badhan\build.js
/**
 * Northstar Studio Static Site Compiler
 * Parses page files in src/pages/, injects them into layout.html,
 * dynamically generates 12 unique project details pages and 20 blog articles,
 * and compiles sitemap.xml and robots.txt in the root workspace directory.
 */

const fs = require('fs');
const path = require('path');

// Load database arrays
const projects = require('./src/data/projects.js');
const blog = require('./src/data/blog.js');

// Paths
const TEMPLATES_DIR = path.join(__dirname, 'src/templates');
const PAGES_DIR = path.join(__dirname, 'src/pages');
const DIST_DIR = __dirname; // Output in workspace root

function build() {
  console.log('Starting site compilation pipeline...');

  // 1. Load layout template
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
      // Replace all occurrences of {{key}}
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
        // Enforce JSON standard by adding outer braces
        meta = JSON.parse('{' + match[1] + '}');
        body = fileContent.replace(metaRegex, '').trim();
      } catch (err) {
        console.error('JSON parsing failed on file metadata header block:', err);
      }
    }
    return { meta, body };
  };

  // 2. Compile Core 35 HTML Pages from src/pages/
  const pageFiles = fs.readdirSync(PAGES_DIR).filter(file => file.endsWith('.html'));

  pageFiles.forEach(file => {
    const filePath = path.join(PAGES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { meta, body } = parsePageContent(content);

    let finalBody = body;

    // Special injection for Blog Hub: render the list of 20 posts statically
    if (file === 'blog.html') {
      const blogPostsHtml = blog.map(post => {
        // Extract plain text snippet from body tags
        const plainTextSnippet = post.body
          .replace(/<[^>]*>/g, '') // remove HTML tags
          .replace(/MANDATORY DISCLAIMER:[\s\S]*?\./, '') // remove disclaimer
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
            <a href="blog-${post.id}.html" class="btn btn-secondary btn-sm">Read Post</a>
          </div>
        </article>
        `;
      }).join('\n');

      finalBody = finalBody.replace('{{blog_posts}}', blogPostsHtml);
    }

    const pageVariables = {
      title: meta.title || 'Northstar Studio | Portfolio',
      description: meta.description || 'Fictional portfolio website layout and visual system.',
      canonical: `https://northstar.example.com/${file}`,
      og_image: 'images/project-placeholder.svg',
      content: finalBody
    };

    const compiledHtml = compilePage(layout, pageVariables);
    const outputFilePath = path.join(DIST_DIR, file);
    fs.writeFileSync(outputFilePath, compiledHtml, 'utf8');
    
    compiledFiles.push(file);
    console.log(`Compiled page: ${file}`);
  });

  // 3. Compile 12 Unique Project Details Pages
  projects.forEach(project => {
    const filename = `project-details-${project.id}.html`;
    
    const bodyContent = `
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
            <img src="${project.coverImage}" alt="${project.title} Mockup cover preview display" style="width: 100%;" />
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
                  <div class="card" style="padding: 0.5rem; cursor: pointer;" onclick="openGalleryModal('${img}', '${project.title} Gallery Slot ${i+1}')">
                    <img src="${img}" alt="${project.title} screenshot illustration ${i+1}" style="width: 100%;" />
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

    const pageVariables = {
      title: `${project.title} | Case Study`,
      description: project.description,
      canonical: `https://northstar.example.com/${filename}`,
      og_image: 'images/project-placeholder.svg',
      content: bodyContent
    };

    const compiledHtml = compilePage(layout, pageVariables);
    const outputFilePath = path.join(DIST_DIR, filename);
    fs.writeFileSync(outputFilePath, compiledHtml, 'utf8');

    compiledFiles.push(filename);
    console.log(`Compiled Project Details page: ${filename}`);
  });

  // 4. Compile 20 Unique Blog Articles Pages
  blog.forEach(post => {
    const filename = `blog-${post.id}.html`;

    const bodyContent = `
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

        <!-- Table of Contents component -->
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

        <!-- Related Posts section -->
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

    const pageVariables = {
      title: `${post.title} | Blog`,
      description: `Fictional article post detailing ${post.category.toLowerCase()} variables.`,
      canonical: `https://northstar.example.com/${filename}`,
      og_image: 'images/project-placeholder.svg',
      content: bodyContent
    };

    const compiledHtml = compilePage(layout, pageVariables);
    const outputFilePath = path.join(DIST_DIR, filename);
    fs.writeFileSync(outputFilePath, compiledHtml, 'utf8');

    compiledFiles.push(filename);
    console.log(`Compiled Blog Article page: ${filename}`);
  });

  // 5. Generate sitemap.xml in root
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

  // 6. Generate robots.txt in root
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://northstar.example.com/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt.trim(), 'utf8');
  console.log('Compiled robots.txt successfully!');

  console.log('Compilation pipeline completed successfully! generated ' + compiledFiles.length + ' pages.');
}

build();
