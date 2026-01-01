import fs from "fs/promises";
import fs2 from "fs";
import path from "path";
import { createRequire } from "module";
import os from "os";
import crypto from "crypto";
const require = createRequire(import.meta.url);
const { EPub } = require("@lesjoursfr/html-to-epub");

// --- Async helper to convert relative URLs to absolute, remove missing images ---
async function makeUrlsAbsolute(html, pageInputPath) {
  const pageDir = path.dirname(pageInputPath);

  async function fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // --- img src ---
html = html.replace(/<img\s+([^>]*?)src=(["']?)([^"' >]+)\2([^>]*)>/g, (_, before, quote, src, after) => {
  // skip absolute URLs
  if (/^https?:\/\//.test(src) || src.startsWith("file://") || src.startsWith("data:")) {
   // console.log(`Keeping absolute image: ${src}`);
    return `<img ${before}src=${quote}${src}${quote}${after}>`;
  }

  const absPath = path.resolve(pageDir, src).replace(/\\/g, "/");
  if (!fs2.existsSync(absPath)) {
    console.warn(`Image file not found, removing: ${absPath}`);
    return ""; // remove missing image
  }

  //console.log(`Rewriting image src: ${src} → ${absPath}`);
  return `<img ${before}src=${quote}${absPath}${quote}${after}>`;
});

  // --- img srcset ---
html = html.replace(/<img\s+([^>]*?)srcset="([^"]+)"([^>]*)>/g, async (_, before, srcset, after) => {
  const entries = await Promise.all(srcset.split(",").map(async entry => {
    let [url, size] = entry.trim().split(/\s+/);
    if (/^https?:\/\//.test(url) || url.startsWith("file://")) return entry;
    const absPath = path.resolve(pageDir, url);
    if (!(await fileExists(absPath))) {
      console.warn(`Image file not found in srcset, removing: ${absPath}`);
      return null;
    }
    return size ? `${absPath} ${size}` : absPath;
  }));
  const absSrcset = entries.filter(Boolean).join(", ");
  return absSrcset ? `<img ${before}srcset="${absSrcset}"${after}>` : `<img ${before}${after}>`;
});

  // --- link href ---
  html = html.replace(/<link\s+([^>]*?)href="([^":]+)"([^>]*)>/g, (_, before, href, after) => {
    if (/^https?:\/\//.test(href) || href.startsWith("file://")) return `<link ${before}href="${href}"${after}>`;
    const absPath = path.resolve(pageDir, href);
    if (!fs2.existsSync(absPath)) {
      console.warn(`Link file not found: ${absPath}`);
      return `<link ${before}href="${href}"${after}>`;
    }
    return `<link ${before}href="${absPath}"${after}>`;
  });

  // --- CSS url(...) ---
  html = html.replace(/url\((['"]?)([^'")]+)\1\)/g, (_, quote, url) => {
    if (/^https?:\/\//.test(url) || url.startsWith("file://")) return `url(${quote}${url}${quote})`;
    const absPath = path.resolve(pageDir, url);
    if (!fs2.existsSync(absPath)) {
      console.warn(`CSS resource not found: ${absPath}`);
      return `url(${quote}${url}${quote})`;
    }
    return `url(${quote}${absPath}${quote})`;
  });

  return html;
}

// --- Async shortcode for generating EPUB ---
//let lastPromise = Promise.resolve();
export async function ebookShortcode(...args) {
  let content, page, options;

  // Parse arguments robustly
  if (args.length === 3) {
    [content, page, options] = args;
  } else if (args.length === 2) {
    [content, page] = args;
    options = {};
  } else if (args.length === 1) {
    [page] = args;
    options = {};
    content = page?.templateContent ?? "";
  } else {
    throw new Error("ebook shortcode: invalid arguments");
  }

  if (!page?.fileSlug) return "";

  // Convert Nunjucks SafeString → string
  if (content && typeof content.toString === "function") {
    content = content.toString();
  }
  content = content || "";

  const title = options.title ?? page.data?.title ?? page.fileSlug;
  const author = options.author ?? page.data?.author ?? "Unknown author";
  const language = options.language ?? "en";
  
  const outputDir = options.outputDir ?? "src/assets/ebooks";

  // --- Preprocess content: convert relative URLs to absolute and remove missing images ---
  content = await makeUrlsAbsolute(content, page.inputPath);

  // Build chapters
  const chapters = [
    {
      title: "Chapter 1",
      data: content
    }
  ];

  // Output path
  const outputPath = path.join(process.cwd(), outputDir, `${page.fileSlug}.epub`);

  let optionsepub={
      title,
      author: author,
      lang: language,
      tocTitle: "Contents",
      content: chapters
   //   verbose:true,
    };
    
    if (options.cover) {  
      const pageDir =path.dirname(page.inputPath);
  const absPath = path.resolve(pageDir, options.cover).replace(/\\/g, "/");
      optionsepub.cover=absPath;
    }
    if (options.css) { 
            optionsepub.css=options.css;
    }
    
  // Generate EPUB
  const epub = new EPub(
    optionsepub,
    outputPath
  );

  try {
    await epub.render();
    console.log(`Ebook generated successfully: ${outputPath}`);
  } catch (err) {
    console.error(`Failed to generate Ebook: ${outputPath}`+content, err);
  }

  return "";

}
