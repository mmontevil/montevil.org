import { createRequire } from "module";

import { readFromCache, writeToCache } from "../../_utils/cache.js";

const COMMENTS_CACHE = "src/comments/comments.json";
let comments = false;

export const getCommentsForUrl = (url) => {
  if (!url) {
    console.log("No URL for comments matching");
    return [];
  }

  const contentPath = url.replace(/^\/(.*)\/$/, "$1");

  if (comments === false) {
    comments = readFromCache(COMMENTS_CACHE);
  }

  return comments?.[contentPath] || [];
};
