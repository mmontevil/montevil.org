
import fs from 'fs';

const memoizedIncludes = {};

export default function include_raw(file) {
  if (file in memoizedIncludes) {
    return memoizedIncludes[file];
  }

  const content = fs.readFileSync(file, 'utf8');
  memoizedIncludes[file] = content;
  return content;
}
