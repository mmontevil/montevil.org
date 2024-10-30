const truncateHtml = require('truncate-html');
const entities = require('entities');
var replaceall = require('replaceall');
const addAnchordom = require('../../_utils/addAnchordom');

module.exports = {
  addAnchor: (content) => {
    return addAnchordom(content);
  },
  divRemove: (content) => {
    const regex = /(<div ((?!(>)).|\n)+>)|(<\/div>)/gm;
    return content.replace(regex, '');
  },
  excerpt: (content) => {
    if (content === undefined) {
      return '';
    }
    const regex = /(<p( [^>]*)?>((?!(<\/p>)).|\n)+<\/p>)/m;
    let excerpt = '';

    // Remove paragraphs containing only an image
    cleanContent = content.replace(/<p><img [^>]+><\/p>/, '');

    // Get first paragraph, if there's at least one, and remove the paragraph tag
    if ((matches = regex.exec(cleanContent)) !== null) {
      excerpt = matches[0].replace(
        /<p( [^>]*)?>(((?!(<\/p>)).|\n)+)<\/p>/,
        '$2'
      );
    }

    return excerpt;
  },
};
