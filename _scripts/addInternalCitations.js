import fs from "fs";
import path from "path";
import linkCitations from "../src/_11ty/filters/linkCitations.js";

/* ---------------- CONFIG ---------------- */


/* ---------------- PROCESS ---------------- */

// Directory where `npm run ...` was executed
const cwd = process.env.INIT_CWD || process.cwd();
const FILE_PATH = path.join(cwd, "index.njk");

/* ---------------- PROCESS ---------------- */
function preserveLineBreaks(content) {
  return content
    .split(/\r?\n/)
    .map(line => linkCitations(line))
    .join("\n");
}


try {
  const originalContent = fs.readFileSync(FILE_PATH, "utf8");
  const transformedContent = linkCitations(originalContent);
  fs.writeFileSync(FILE_PATH, transformedContent, "utf8");

  console.log(`✅ index.njk processed in ${cwd}`);
} catch (error) {
  console.error(`❌ Error processing index.njk in ${cwd}:`, error.message);
  process.exit(1);
}
