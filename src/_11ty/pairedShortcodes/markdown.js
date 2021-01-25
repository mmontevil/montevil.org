const markdownIt = require('markdown-it');
 
 const fs = require('fs');
const linkifyUrls = require('linkify-urls');
const Cite = require('citation-js');
const path = require('path');


module.exports = {
  markdown: (content, inline = null) => {
    return inline
      ? markdownIt.renderInline(content)
      : markdownIt.render(content);
  },

};
