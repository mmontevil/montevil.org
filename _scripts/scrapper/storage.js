import fs from "fs";
import path from "path";

const CACHE_PATH = path.resolve("scholar-cache.json");

export function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return [];
  return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
}

export function saveCache(data) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
}