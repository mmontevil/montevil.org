// utils/addAutoref.mjs
import { DOMParser } from 'linkedom';
import fs from 'fs';
import stringComparison from 'string-similarity';
import Cite from 'citation-js';
import memoize from 'memoize';

const { compareTwoStrings: cos } = stringComparison;

// Strip HTML tags
const stripHTMLTags = str => str.replace(/<[^>]*>/g, '');

// Clean text
function clean(text) {
  return stripHTMLTags(text)
    .replace(/[^a-zA-Z\séèë]+/g, ' ')
    .toLowerCase()
    .replace(/doi/g, '')
    .replace(/\s\s+/g, ' ')
    .replace(/cited on pages sq/g, '')
    .replace(/issn/g, '')
    .replace(/isbn/g, '')
    .replace(/op cit/g, '')
    .replace(/\s\s+/g, ' ')
    .replace(/figure/g, '');
}

// Citation
const config = Cite.plugins.config.get('@csl');
const templateName = 'chicago';
const cite00 = function(jsonentry) {
  const cite = new Cite(JSON.stringify(jsonentry));
  return cite.format('bibliography', {
    format: 'text',
    template: templateName,
    lang: 'en-US',
  });
};
const cite0 = memoize(cite00);

// Map ID to URL
function idToUrl0(id) {
  let res = '';
  if (fs.existsSync(`./src/publications/chapters/${id}`)) res = `/publications/chapters/${id}`;
  if (fs.existsSync(`./src/publications/varia/${id}`)) res = `/publications/varia/${id}`;
  if (fs.existsSync(`./src/publications/books/${id}`)) res = `/publications/books/${id}`;
  if (fs.existsSync(`./src/publications/articles/${id}`)) res = `/publications/articles/${id}`;
  return res;
}

const idToUrl = memoize(idToUrl0);


// Test function
function testmoi(bibitem) {
  let item = bibitem;
  while (item.innerHTML.includes('——') || item.innerHTML.includes('___')) {
    item = item.previousElementSibling;
  }
  return item.innerHTML.includes('Montévil');
}

export function findOrigin(strip,bibM) {
      let similarity = 0;
      let resultat = '';
      let resid = '';
      let strip2= strip.toLowerCase();
      for (const entry in bibM) {
        const txt = bibM[entry].title.toLowerCase()+bibM[entry]?.["container-title"]?.toLowerCase();//cite0(bibM[entry]);
        const test = cos(clean(txt), strip2);
        if (test > similarity) {
          resultat = txt;
          similarity = test;
          resid = bibM[entry].id;
        }
      }
      //console.log("--------");
      //console.log(strip);
      //console.log(resultat);
      // Special overrides
      if (resid === '2014-LM-ScalingScaleSymmetries') resid = '2014-LM-Perspectives-Organisms';
      if (resid === '2018-ML-Big-Data-Biology-ISLS') resid = '2018-ML-Big-Data-Biology';


      return idToUrl(resid);
}
export const anchorSvg ='<svg  class="svgnofill icon svgleft" role="img" focusable="false" aria-label="Anchor"><use xlink:href="#symbol-anchor" /></svg>';

// Main async function
async function addAutoref(html, bibM) {
  if (html.includes('bibitem')||html.includes('citedbyitem')){
  const document = new DOMParser().parseFromString(html, 'text/html');
  const selector = 'li.bibitem,li.citedbyitem';

  [...document.querySelectorAll(selector)].forEach((bibitem) => {
    if (testmoi(bibitem)) {
      let res = '';
      bibitem.querySelectorAll('a').forEach((link) => {
        if (link.getAttribute('href')?.includes('http')) res = link.getAttribute('href');
      });

      const strip = clean(bibitem.innerHTML);
 
      const link = document.createElement('a');
      link.setAttribute('href', findOrigin(strip,bibM));
      link.setAttribute('class', 'anchorlink');
      link.innerHTML =anchorSvg;
      bibitem.appendChild(link);
    }
  });

  return await document.toString();
  }else{
    return html;
  }
}

// Export as default
export default addAutoref;
