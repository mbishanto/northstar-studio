// c:\Users\NAK\coding code - badhan\verify.js
/**
 * Northstar Studio Link & Page Verification Utility
 * Parses all compiled HTML files in the root workspace directory, extracts anchor tags
 * (excluding javascript script blocks), and asserts that every target file exists.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

function verify() {
  console.log('Starting static navigation integrity validation...');

  const htmlFiles = fs.readdirSync(ROOT_DIR).filter(file => file.endsWith('.html'));
  
  if (htmlFiles.length === 0) {
    console.error('No HTML files located in the root workspace!');
    process.exit(1);
  }

  let totalLinksChecked = 0;
  let brokenLinksCount = 0;
  const brokenLinks = [];

  htmlFiles.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Strip script blocks to avoid parsing template strings inside JS scripts
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

    // Extract all href values from anchor tags
    const hrefRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
    let match;

    while ((match = hrefRegex.exec(html)) !== null) {
      const href = match[1];
      totalLinksChecked++;

      // Skip external links, mailto/tel protocol, and local anchors
      if (
        href.startsWith('http://') || 
        href.startsWith('https://') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') || 
        href.startsWith('#')
      ) {
        continue;
      }

      // Check if target file exists in root workspace
      const targetFilename = href.split('#')[0]; // Strip hash anchors
      
      if (!targetFilename) continue;

      const targetPath = path.join(ROOT_DIR, targetFilename);
      
      if (!fs.existsSync(targetPath)) {
        brokenLinksCount++;
        brokenLinks.push({
          sourceFile: file,
          href: href,
          targetFile: targetFilename
        });
      }
    }
  });

  console.log(`\nVerification Summary:`);
  console.log(`- Total HTML Files Checked: ${htmlFiles.length}`);
  console.log(`- Total Link References Inspected: ${totalLinksChecked}`);
  console.log(`- Broken Links Found: ${brokenLinksCount}`);

  if (brokenLinksCount > 0) {
    console.error('\nBroken Links Located:');
    brokenLinks.forEach(link => {
      console.error(`  - In [${link.sourceFile}]: Link to "${link.href}" is broken (File not found: ${link.targetFile})`);
    });
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All navigation links are valid. No broken references found!');
    process.exit(0);
  }
}

verify();
