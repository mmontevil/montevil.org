const { DOMParser, parseHTML } =require('linkedom');
var fs = require('fs');
const stripHTMLTags = str => str.replace(/<[^>]*>/g, '');
const stringComparison = require('string-similarity');
const cos = stringComparison.compareTwoStrings;

function clean(text) {return stripHTMLTags(text).replace(/[^a-zA-Z\séèë]+/g, ' ').toLowerCase().replace(/doi/g,'').replace(/\s\s+/g, ' ').replace(/cited on pages sq/g,'').replace(/issn/g,'').replace(/isbn/g,'').replace(/op cit/g,'').replace(/\s\s+/g, ' ')};


const Cite = require('citation-js');
const config = Cite.plugins.config.get('@csl');
const templateName = 'chicago';
const cite00 = function(jsonentry) {
          const cite = new Cite(JSON.stringify(jsonentry));
          return cite.format('bibliography', {
          format: 'text',
          template: templateName,
          lang: 'en-US',
        });
          
}
const memoize = require('fast-memoize');

const cite0 = memoize(cite00);


function idToUrl(id) {
  res="";
  if (fs.existsSync("./src/publications/chapters/".concat(id))){
    res="/publications/chapters/".concat(id)
  }
    if (fs.existsSync("./src/publications/varia/".concat(id))){
    res="/publications/varia/".concat(id)
  }
      if (fs.existsSync("./src/publications/books/".concat(id))){
    res="/publications/books/".concat(id)
  }
        if (fs.existsSync("./src/publications/articles/".concat(id))){
    res="/publications/articles/".concat(id)
  }
  if(res==""){
    //console.log(id);
  }
  return res;
}


function testmoi(bibitem) {
  item=bibitem;
  while (item.innerHTML.includes("——")|| item.innerHTML.includes("___")){
    item=item.previousElementSibling;
  }
  return item.innerHTML.includes("Montévil");
}


function addAutoref(html,bibM) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const selector = 'li.bibitem,li.citedbyitem';
  [...document.querySelectorAll(selector)].forEach((bibitem) => {
    
    if (testmoi(bibitem)) {
      res="";
      bibitem.querySelectorAll('a').forEach((link) => {if(link.getAttribute('href').includes("http")){res=link.getAttribute('href');
        };
      });
  
      strip=clean(bibitem.innerHTML);
      similarity=0;
      resultat="";
      resid="";
      
      
      for (entry in bibM){
        var txt=cite0(bibM[entry]);
      
        test=cos(clean(txt),strip);
        if(test>similarity){
          resultat=txt;
          similarity=test;
          resid=bibM[entry].id;
        }
      }
      if (resid=="2014-LM-ScalingScaleSymmetries"){
        resid="2014-LM-Perspectives-Organisms";
      }
      if (resid=="2018-ML-Big-Data-Biology-ISLS"){
        resid="2018-ML-Big-Data-Biology";
      }
      
      //console.log(similarity);
      //console.log(stripHTMLTags(bibitem.innerHTML));
      //console.log(resultat);
    const link = document.createElement('a');
    link.setAttribute('href', idToUrl(resid));
    link.setAttribute('class', "anchorlink");
    link.innerHTML =
      '<svg  class="svgnofill icon svgleft" role="img" focusable="false" aria-label="Anchor"><use xlink:href="#symbol-anchor" /></svg>';
    bibitem.appendChild(link);
    //document.insertBefore(link, bibitem.firstChild);

  }
  }
    );

  return document.toString();

}

module.exports = addAutoref;
