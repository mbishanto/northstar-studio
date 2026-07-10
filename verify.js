// c:\Users\NAK\coding code - badhan\verify.js
/**
 * Northstar Studio Link & Page Verification Utility
 * Recursively scans all compiled HTML files inside the root directory and pages/ directories,
 * parses anchors and image sources, resolves relative routes, and checks that every target file exists on disk.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

// Helper: Recursively walk directories and retrieve all HTML files
function walkSync(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    // Skip source folders and metadata caches
    if (file === 'src' || file === 'node_modules' || file === '.git' || file === '.gemini') {
      return;
    }

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkSync(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function verify() {
  console.log('Starting recursive link and image integrity validation...');

  const htmlFiles = walkSync(ROOT_DIR);
  
  if (htmlFiles.length === 0) {
    console.error('No HTML files located in the workspace!');
    process.exit(1);
  }

  let totalLinksChecked = 0;
  let brokenLinksCount = 0;
  const brokenLinks = [];

  htmlFiles.forEach(filePath => {
    const fileRelative = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    let html = fs.readFileSync(filePath, 'utf8');

    // Strip script blocks to avoid parsing template strings inside JS scripts
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

    // 1. Extract all href values from anchor tags
    const hrefRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
    let match;

    while ((match = hrefRegex.exec(html)) !== null) {
      const href = match[1];
      totalLinksChecked++;

      // Skip external links, mailto/tel protocols, and local hash anchors
      if (
        href.startsWith('http://') || 
        href.startsWith('https://') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') || 
        href.startsWith('#') ||
        href.startsWith('javascript:')
      ) {
        continue;
      }

      // Check if target file exists relative to the current file's directory
      const targetFilename = href.split('#')[0]; // Strip hash anchors
      
      if (!targetFilename) continue;

      const currentFileDir = path.dirname(filePath);
      const targetPath = path.resolve(currentFileDir, targetFilename);
      
      if (!fs.existsSync(targetPath)) {
        brokenLinksCount++;
        brokenLinks.push({
          sourceFile: fileRelative,
          href: href,
          targetFile: path.relative(ROOT_DIR, targetPath).replace(/\\/g, '/'),
          isImage: false
        });
      }
    }

    // 2. Extract all src values from img tags
    const imgRegex = /<img\s+[^>]*src=["']([^"']+)["']/gi;
    let imgMatch;

    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const src = imgMatch[1];
      totalLinksChecked++;

      // Skip external urls, data URIs
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
        continue;
      }

      // Check if target image file exists relative to the current file's directory
      const targetFilename = src.split('?')[0]; // Strip query parameters
      
      if (!targetFilename) continue;

      const currentFileDir = path.dirname(filePath);
      const targetPath = path.resolve(currentFileDir, targetFilename);
      
      if (!fs.existsSync(targetPath)) {
        brokenLinksCount++;
        brokenLinks.push({
          sourceFile: fileRelative,
          href: src,
          targetFile: path.relative(ROOT_DIR, targetPath).replace(/\\/g, '/'),
          isImage: true
        });
      }
    }
  });

  console.log(`\nVerification Summary:`);
  console.log(`- Total HTML Files Checked: ${htmlFiles.length}`);
  console.log(`- Total References Inspected: ${totalLinksChecked}`);
  console.log(`- Broken Elements Found: ${brokenLinksCount}`);

  if (brokenLinksCount > 0) {
    console.error('\nBroken Links/Images Located:');
    brokenLinks.forEach(link => {
      if (link.isImage) {
        console.error(`  - In [${link.sourceFile}]: Image src "${link.href}" is broken (File not found: ${link.targetFile})`);
      } else {
        console.error(`  - In [${link.sourceFile}]: Link to "${link.href}" is broken (File not found: ${link.targetFile})`);
      }
    });
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All navigation links and images are valid. No broken references found!');
    process.exit(0);
  }
}

verify();
