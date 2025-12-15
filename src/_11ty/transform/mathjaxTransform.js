// mathjaxTransform.js (ESM)

import { mathjax } from 'mathjax-full/js/mathjax.js';
import { MathML } from 'mathjax-full/js/input/mathml.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AssistiveMmlHandler } from 'mathjax-full/js/a11y/assistive-mml.js';
import 'mathjax-full/js/util/entities/all.js';

import CleanCSS from 'clean-css';
import { DOMParser } from 'linkedom';

export default async function mathjaxTransform(content, outputPath) {
  if (
    outputPath &&
    outputPath.endsWith('.html') &&
    outputPath.includes('publications') &&
    (outputPath.includes('articles') || outputPath.includes('chapters')) &&
    content.includes('<!--CompileMaths-->')
  ) {
    const adaptor = liteAdaptor({
      fontSize: 16,
      cjkCharWidth: 0,
      unknownCharWidth: 0,
      unknownCharHeight: 0,
    });

    AssistiveMmlHandler(RegisterHTMLHandler(adaptor));

    // Create MathJax document
    const mathml = new MathML();
    const chtml = new CHTML({
      fontURL: '/assets/fonts/woff-2',
      exFactor: 8 / 16,
    });

    const html = mathjax.document(content, {
      InputJax: mathml,
      OutputJax: chtml,
    });

    // Typeset
    html.render();

    let content2 =
      adaptor.doctype(html.document) +
      adaptor.outerHTML(adaptor.root(html.document));

    // Minify MathJax CSS
    const document = new DOMParser().parseFromString(content2, 'text/html');

    for (const style of document.querySelectorAll('#MJX-CHTML-styles')) {
      style.innerHTML = new CleanCSS({
        level: {
          1: {
            all: true,
            normalizeUrls: false,
          },
          2: {
            restructureRules: true,
          },
        },
      }).minify(style.innerHTML).styles;
    }

    return document.toString();
  }

  return content;
}
