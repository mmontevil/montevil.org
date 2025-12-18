import path from "path";
import fs from "fs";

export const dirname = (filePath) => {
  return path.dirname(filePath);
};

export const includeifex = async (id) => {
  const tagContentPath = `src/talks/talksSnippet/${id}.md`;

  if (fs.existsSync(tagContentPath)) {
    return fs.readFileSync(tagContentPath, "utf8");
  }

  return "";
};

export const hasTag = (collection, tag) => {
  if (!Array.isArray(collection)) return [];

  return collection.filter((item) =>
    item.data?.tags?.includes(tag)
  );
};

