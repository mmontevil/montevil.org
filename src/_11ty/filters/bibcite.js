const fs = require('fs');
const linkifyUrls = require('linkify-urls');
//const linkifyUrls = import("../../../node_modules/linkify-urls/index.js")
//const linkifyUrls = require('../../_utils/linkify');

//import linkifyUrls from 'linkify-urls';
//const Cite = require('citation-js');
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

  bibcite: (bibfi) => {
    let relativeFilePath = `${bibfi}`;
    let rawBib = fs.readFileSync(relativeFilePath);
    const cite = new Cite(`${rawBib}`);
    return linkifyUrls(
      cite.format('bibliography', {
        format: 'html',
        template: templateName,
        lang: 'en-US',
      })
    );
  },
  bibbibtex: (bibfi) => {
    let relativeFilePath = `${bibfi}`;
    let rawBib = fs.readFileSync(relativeFilePath);
    const cite = new Cite(`${rawBib}`);
    return cite.format('bibtex', {
      format: 'html',
      template: templateName,
      lang: 'en-US',
    });
  },
  bibcite3: (bibfi) => {
    const cite = new Cite(JSON.stringify(bibfi));
    return linkifyUrls(
      cite.format('bibliography', {
        format: 'html',
        template: templateName,
        lang: 'en-US',
      })
    );
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
