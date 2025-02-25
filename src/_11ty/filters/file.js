const path = require('path');
const fs = require('fs');

module.exports = {
  dirname: (filePath) => {
    return path.dirname(filePath);
  },
  includeifex: (id) => {
    let tagContentPath = `src/talks/talksSnippet/${id}.md`;
    if (fs.existsSync(tagContentPath)) {
      return fs.readFileSync(tagContentPath, {
        encoding: 'utf8',
      });
    } else {
      return '';
    }
  },
  hasTag(collection, tag) {
    return collection.filter(function (item) {
      return item.data.tags.includes(tag);
    });
  },
};
