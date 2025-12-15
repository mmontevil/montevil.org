import fs from "fs";
import path from "path";
import linkifyUrls from "linkify-string";
import Cite from "citation-js";

// Read CSL template
const template = fs.readFileSync("assets/chicago-author-date.csl", "utf8");
const templateName = "chicago";

// Register CSL template
const config = Cite.plugins.config.get("@csl");
config.templates.add(templateName, template);

// Memoization cache
const memoizedCite = {};

export const urlify = (text) => {
  return linkifyUrls(text);
};

export const bibcite2 = (bibfi) => {
  if (!bibfi || !bibfi.id) return ''; // <- return empty string if missing
  if (bibfi.id in memoizedCite) {
    return memoizedCite[bibfi.id];
  }

  const cite = new Cite(JSON.stringify(bibfi));
  let res = cite.format("bibliography", {
    format: "html",
    template: templateName,
    lang: "en-US",
  });

  const reg = /(http.*)</gi;
  res = res.replace(reg, '<a href="$1">$1</a><');

  memoizedCite[bibfi.id] = res;
  return res;
};



//    var find2 =find.replace(/[-[\]{}()*+?.,\\^$|]/g, "\s*.*");
// var reg0 = new RegExp('('+find2+')', 'gi');
