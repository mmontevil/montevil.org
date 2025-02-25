const fs = require('fs');
const linkifyUrls = require("linkify-string");
const path = require('path');
const template = String(fs.readFileSync('assets/chicago-author-date.csl'));
let templateName = 'chicago';
const Cite = require('citation-js');

const config = Cite.plugins.config.get('@csl');
config.templates.add(templateName, template);

let memoizedCite = {};

module.exports = {
  urlify: (text) => {
    return linkifyUrls(text);
  },
  bibcite2: (bibfi) => {
    if (bibfi.id in memoizedCite) {
      return memoizedCite[bibfi.id];
    } else {
      const cite = new Cite(JSON.stringify(bibfi));
      var res = cite.format('bibliography', {
        format: 'html',
        template: templateName,
        lang: 'en-US',
      });
      var reg = new RegExp('(http.*)<', 'gi');
      res = res.replace(reg, '<a href="$1">$1</a><');
      memoizedCite[bibfi.id] = res;
      return res;
    }
  },
};

//    var find2 =find.replace(/[-[\]{}()*+?.,\\^$|]/g, "\s*.*");
// var reg0 = new RegExp('('+find2+')', 'gi');
