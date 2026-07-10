# Northstar Studio — Premium Developer Portfolio & Case Studies

A high-performance, accessible, and responsive static website template built to demonstrate senior-level visual aesthetics, layout principles, and optimization strategies. Designed with inspiration from Apple, Linear, Vercel, and Stripe.

---

## 🚀 Performance & Architectural Features

- **Static Template Engine (`build.js`)**: A native, zero-dependency compiler that combines HTML content modules, database entries, and global layouts.
- **Auto Link Rewriter**: Automatically maps and rewrites internal relative routes based on output folder nesting configurations (handles depth calculations like `../../` automatically).
- **SEO Ready**: Compiles custom metadata variables, canonical indicators, Schema.org JSON-LD structures, Open Graph properties, and generates compliant `sitemap.xml` and `robots.txt` entries.
- **WCAG 2.1 AA Compliant**: Features top skip navigation, focus-visible rings with offset bounds, high contrast ratios, semantic landmarks, and full keyboard-dialog traversal.
- **Fast Interactivity**: Integrates IntersectionObserver scrolling reveals, dynamic pricing switch grids, and a keyboard-triggered live modal search panel (Press `/`).

---

## 📂 Reorganized Folder Structure

```
├── build.js                        # Site compiler pipeline script
├── verify.js                       # Link integrity validation scanner
├── LICENSE                         # MIT License
├── README.md                       # Documentation handbook
├── sitemap.xml                      # Generated Sitemap
├── robots.txt                       # Generated Robots rule file
├── assets/
│   ├── css/style.css               # Compiled style rules
│   ├── js/script.js                # Compiled interactive script
│   └── images/                     # Compiled asset illustrations
└── src/
    ├── assets/                     # Master source styles and assets
    ├── data/                       # Mock databases (projects.js, blog.js)
    ├── templates/                  # Page layout wrapper (layout.html)
    └── pages/                      # 50 core HTML fragments (contains frontmatter JSON)
```

---

## 🛠 Installation & Local Development

### 1. Requirements
Ensure you have **Node.js (v18+)** installed.

### 2. Development Setup
To compile changes or add pages:
```bash
# Compile all 82 HTML pages, assets, sitemaps, and robots configuration
node build.js

# Validate internal link references and verify zero broken links
node verify.js
```

---

## 🎨 Customization
- **Style Customization**: Update token values (`--bg-color`, `--accent-cyan`, `--radius-md`, etc.) inside [src/assets/css/style.css](file:///c:/Users/NAK/coding%20code%20-%20badhan/src/assets/css/style.css).
- **Content Database**: Modify project attributes inside [src/data/projects.js](file:///c:/Users/NAK/coding%20code%20-%20badhan/src/data/projects.js) or blog posts inside [src/data/blog.js](file:///c:/Users/NAK/coding%20code%20-%20badhan/src/data/blog.js).
- **Routing Categories**: Map new source pages to categorized subdirectories by defining target folders inside the `dirFallbackMap` routing table inside `build.js` or via frontmatter `dir` parameters.

---

## 📜 Future Roadmap
1. **Visual Testing Suite**: Implement headless testing verification checks for element alignments.
2. **Dynamic Serverless Integrations**: Bind mock database operations to telemetry dashboards.
3. **WebAssembly Compression**: Compile heavy indexing logs to Rust scripts.

---

## 🤝 Contributing & License
Refer to [CONTRIBUTING.md](file:///c:/Users/NAK/coding%20code%20-%20badhan/CONTRIBUTING.md) for contribution guidelines. Released under the [MIT License](file:///c:/Users/NAK/coding%20code%20-%20badhan/LICENSE). All content represents simulated mockup listings.
