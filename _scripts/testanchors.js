// file: anchorChecker.js
import fs from 'fs';
import path from 'path';
import { DOMParser } from 'linkedom';

/**
 * Recursively get all HTML files in a folder
 * @param {string} dir - folder path
 * @returns {string[]} array of HTML file paths
 */
export function getAllHtmlFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Check broken anchors in a single HTML file
 * @param {string} filePath - path to the HTML file
 * @returns {string[]} array of broken anchor hrefs
 */
export function checkAnchors(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const doc = new DOMParser().parseFromString(content, 'text/html');

  // Collect all ids
  const ids = new Set();
  const elementsWithId = doc.querySelectorAll('[id]');
  elementsWithId.forEach(el => ids.add(el.id));

  // Check all <a href="#...">
  const brokenAnchors = [];
  const anchors = doc.querySelectorAll('a[href^="#"]');
  anchors.forEach(a => {
    const href = a.getAttribute('href').slice(1); // remove #
    if (href && !ids.has(href)) {
      brokenAnchors.push(href);
    }
  });

  return brokenAnchors;
}

/**
 * Check all HTML files in a folder recursively and report broken anchors
 * Defaults to the '_site' folder in the project root
 * @param {string} folderPath - path to folder containing HTML files
 * @returns {Object} - { filePath: [brokenHref1, brokenHref2, ...], ... }
 */
export function checkSiteAnchors(folderPath = path.join(process.cwd(), '_site')) {
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder not found: ${folderPath}`);
  }

  const allFiles = getAllHtmlFiles(folderPath);
  const report = {};

  allFiles.forEach(file => {
    const broken = checkAnchors(file);
    if (broken.length > 0) {
      report[file] = broken;
    }
  });

  return report;
}

try {
  const report = checkSiteAnchors(); // defaults to '_site'

  if (Object.keys(report).length === 0) {
    console.log('✅ No broken anchors found in _site!');
  } else {
    console.log('🚨 Broken anchors report in _site:');
    for (const [file, broken] of Object.entries(report)) {
      console.log(`\n${file}:`);
      broken.forEach(h => console.log(`  #${h}`));
    }
  }
} catch (err) {
  console.error('Error:', err.message);
}
