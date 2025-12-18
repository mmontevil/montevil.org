import fs from "fs";
import path from "path";
import linkifyUrls from "linkify-string";
import Cite from "citation-js";
import memoize from 'memoize';

// Read CSL template
const template = fs.readFileSync("assets/chicago-author-date.csl", "utf8");
const templateName = "chicago";

// Register CSL template
const config = Cite.plugins.config.get("@csl");
config.templates.add(templateName, template);


export const urlify = (text) => {
  return linkifyUrls(text);
};

 const bibcite = (bibfi) => {
  if (!bibfi || !bibfi.id) return ''; // <- return empty string if missing

  const cite = new Cite(JSON.stringify(bibfi));
  let res = cite.format("bibliography", {
    format: "html",
    template: templateName,
    lang: "en-US",
  });

  const reg = /(http.*)</gi;
  res = res.replace(reg, '<a href="$1">$1</a><');

  return res;
};

export const bibcite2= memoize(bibcite);

//    var find2 =find.replace(/[-[\]{}()*+?.,\\^$|]/g, "\s*.*");
// var reg0 = new RegExp('('+find2+')', 'gi');
