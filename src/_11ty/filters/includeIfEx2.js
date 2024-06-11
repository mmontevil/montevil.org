const fs = require('fs');

module.exports = {
  includeifex2: (id) => {
    let tagContentPath = `src/talks/talksSnippet/${id}.md`;
    if (fs.existsSync(tagContentPath)) {
      return tagContentPath;
    } else {
      return '';
    }
  },
  fExists: (file) => {
    return fs.existsSync(file);
  },
};
