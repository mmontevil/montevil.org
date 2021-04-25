
const {mathjax} = require('mathjax-full/js/mathjax.js');
const {MathML} = require('mathjax-full/js/input/mathml.js');
const {CHTML} = require('mathjax-full/js/output/chtml.js');
const {liteAdaptor} = require('mathjax-full/js/adaptors/liteAdaptor.js');
const {RegisterHTMLHandler} = require('mathjax-full/js/handlers/html.js');
const {AssistiveMmlHandler} = require('mathjax-full/js/a11y/assistive-mml.js');
require('mathjax-full/js/util/entities/all.js');
//const htmlmin = require("html-minifier");
const 	cleancss = require('clean-css');
import { DOMParser, parseHTML } from 'linkedom';

 module.exports = async function(content, outputPath)  {

  if (outputPath && outputPath.endsWith('.html') && outputPath.includes('publications') && (outputPath.includes('articles')  || outputPath.includes('chapters'))  && (content.includes("<!--CompileMaths-->" ))) {
    



const adaptor = liteAdaptor({fontSize: 16,cjkCharWidth: 0, unknownCharWidth: 0, unknownCharHeight: 0});
AssistiveMmlHandler(RegisterHTMLHandler(adaptor));
//RegisterHTMLHandler(adaptor);
//
//  Create input and output jax and a document using them on the content from the HTML file
//
const mathml = new MathML();
const chtml = new CHTML({fontURL: '/assets/fonts/woff-2', exFactor: 8 / 16});
const html = mathjax.document(content, {InputJax: mathml, OutputJax: chtml});

//
//  Typeset the document
//
html.render();
let content2=adaptor.doctype(html.document)+adaptor.outerHTML(adaptor.root(html.document));
 //


   
  const document = new DOMParser().parseFromString(content2, 'text/html');
  const selector = '#MJX-CHTML-styles';
  [...document.querySelectorAll(selector)].forEach((title) => {
   
    title.innerHTML =new cleancss({
  level: {
    1: {
      all: true,
      normalizeUrls: false
    },
    2: {
      restructureRules: true
    }
  }
}).minify(title.innerHTML).styles;
  });

  content2= document.toString();

  return  content2;
    
  }
  return content;
};

