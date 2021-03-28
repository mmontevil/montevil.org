const fs = require('fs');

module.exports = {
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
  fExists: (file) => {
    return fs.existsSync(file);
  },
};
