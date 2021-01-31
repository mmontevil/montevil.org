const slugifyString = require('../../_utils/slugify');

module.exports = {
  base64: (string) => {
    return Buffer.from(string).toString('base64');
  },
  slugify: (string) => slugifyString(string),
  jsonify: (object) => JSON.stringify(object),
  tagToHashtag: (tag) => {
    let words = tag.replace(/[-\.]/, ' ').split(' ');
    return (
      words[0] +
      words
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + word.substr(1))
        .join('')
    );
  },
  orphans: (string) => string.replace(/((.*)\s(.{1,5}))$/g, '$2 $3'),
  titleize: (string) => {
    if (string === undefined) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
    removefirst: (string) => {
    if (string === undefined) return '';
    return string.slice(1);
  },
};
