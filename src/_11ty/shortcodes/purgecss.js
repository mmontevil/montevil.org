// purgeCss.js (ESM)

import { PurgeCSS } from 'purgecss';

export default async function purgeCss(content, cssFiles) {
  const purgecssResult = await new PurgeCSS().purge({
    content: [
      {
        raw: `<html><body>${content}</body></html>`,
        extension: 'html',
      },
    ],
    css: [{ raw: cssFiles }],
    safelist: {
      greedy: [
        /data-theme$/,
        /.*lightbox.*/,
        /.*equation.*/,
        /.*mjx.*/,
        /.*selected-B.*/,
      ],
    },
  });

  let cssMerge = '';

  if (purgecssResult.length) {
    for (const result of purgecssResult) {
      cssMerge += result.css;
    }
    return cssMerge;
  }

  return cssMerge;
}

