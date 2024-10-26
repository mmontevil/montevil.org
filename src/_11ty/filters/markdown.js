const path = require('path');
const entities = require('entities');

const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\(([^\) ]+)( [^\)]+)?\)({.[^}]+})?/g;

function htmlEntities(str) {
  // https://css-tricks.com/snippets/javascript/htmlentities-for-javascript/
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


module.exports = {
  hasImage: (content) => {
    return content.match(MARKDOWN_IMAGE_REGEX);
  },
  imagesAsAttachments: (content, url) => {
    let attachments = [];

    while ((match = MARKDOWN_IMAGE_REGEX.exec(content))) {
      attachments.push({
        url: `${url}${match[2]}`,
        mime_type: `image/${path.extname(match[2]).slice(1)}`,
      });
    }

    return JSON.stringify(attachments);
  }  
};
