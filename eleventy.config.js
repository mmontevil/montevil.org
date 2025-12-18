import path from 'path';
import fs from 'fs';
import { promises as fsp } from 'fs';

import markdownIt from 'markdown-it';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItSpan from 'markdown-it-bracketed-spans';
import markdownItContainer from 'markdown-it-container';
import markdownItAbbr from 'markdown-it-abbr';
import { html5Media } from 'markdown-it-html5-media';

import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import eleventyNavigationPlugin from '@11ty/eleventy-navigation';
import embedYouTube from 'eleventy-plugin-youtube-embed';
import readingTime from 'eleventy-plugin-reading-time';
import pluginTOC from 'eleventy-plugin-nesting-toc';
import linkToPlugin from 'eleventy-plugin-link_to';

import config from './pack11ty.config.js';
import { writeToCache, readFromCache } from './src/_utils/cache.js';
import slugifyFn from './src/_utils/slugify.js';

import imagesResponsiver from './src/_utils/responsiver.js';
import htmlmin from 'html-minifier-next';



/* ---------------- Markdown Helpers ---------------- */
function getHeadingLevel(tagName) {
  if (tagName[0].toLowerCase() === 'h') tagName = tagName.slice(1);
  return parseInt(tagName, 10);
}

function markdownItHeadingLevel(md, options) {
  let firstLevel = options.firstLevel;
  if (typeof firstLevel === 'string') firstLevel = getHeadingLevel(firstLevel);
  if (!firstLevel || isNaN(firstLevel)) return;

  const levelOffset = firstLevel - 1;
  if (levelOffset < 1 || levelOffset > 6) return;

  md.core.ruler.push('adjust-heading-levels', state => {
    for (let i = 0; i < state.tokens.length; i++) {
      if (state.tokens[i].type !== 'heading_close') continue;
      const open = state.tokens[i - 2];
      const close = state.tokens[i];
      const level = getHeadingLevel(open.tag);
      const tag = 'h' + Math.min(level + levelOffset, 6);
      open.tag = tag;
      close.tag = tag;
    }
  });
}

/* ---------------- ESM Eleventy Config ---------------- */
export default async function (eleventyConfig) {
  eleventyConfig.on('eleventy.before', async () => {
    // Initialize global cache before build
    if (!globalThis.__cachedPeople__) {
      globalThis.__cachedPeople__ = {};
    }
    const peopleData = await readFromCache('_cache/people.json', {});
    Object.assign(globalThis.__cachedPeople__, peopleData);
  });
  
  /* ---------------- After Build ---------------- */
  eleventyConfig.on('eleventy.after', () => {
    const cachedPeople = globalThis.__cachedPeople__;
    writeToCache(cachedPeople, '_cache/people.json');
  });

  /* ---------------- Collections ---------------- */
  const tags = await import('./src/_11ty/collections/tags.js');
  Object.entries(tags).forEach(([name, fn]) =>
    eleventyConfig.addCollection(name, fn)
  );

  const { default: collections } = await import('./src/_11ty/collections/years-and-months.js');
  Object.entries(collections).forEach(([name, fn]) =>
    eleventyConfig.addCollection(name, fn)
  );

  /* ---------------- Filters ---------------- */
  const filterModules = [
    './src/_11ty/filters/collection.js',
    './src/_11ty/filters/bibcite.js',
    './src/_11ty/filters/array.js',
    './src/_11ty/filters/comments.js',
    './src/_11ty/filters/dates.js',
    './src/_11ty/filters/file.js',
    './src/_11ty/filters/string.js',
    './src/_11ty/filters/html.js',
  ];

  for (const mod of filterModules) {
    const filters = await import(mod);
    Object.entries(filters).forEach(([name, fn]) =>
      eleventyConfig.addFilter(name, fn)
    );
  }

  const { default: addAnchorDom } = await import('./src/_11ty/filters/addAnchordom.js');
  eleventyConfig.addFilter('addAnchor', addAnchorDom);

  /* ---------------- Shortcodes ---------------- */
  const { default: ogImage } = await import('./src/_11ty/shortcodes/ogImage.js');
  eleventyConfig.addShortcode('ogImage', ogImage);

  const { default: includeRaw } = await import('./src/_11ty/shortcodes/include_raw.js');
  eleventyConfig.addShortcode('include_raw', includeRaw);

  const { default: icon } = await import('./src/_11ty/shortcodes/images.js');
  eleventyConfig.addShortcode('icon', icon);

  const { authors, renderCitedBy } = await import('./src/_11ty/shortcodes/authors.js');
  eleventyConfig.addShortcode('authors', authors);
  eleventyConfig.addShortcode('renderCitedBy', renderCitedBy);

  const { default: addAutoref } = await import('./src/_11ty/shortcodes/addAutoref.js');
  eleventyConfig.addShortcode('addAutoref', addAutoref);

  const { default: purgeCss } = await import('./src/_11ty/shortcodes/purgecss.js');
  eleventyConfig.addShortcode('purgeCss', purgeCss);

  /* ---------------- Plugins ---------------- */
  eleventyConfig.addPlugin(syntaxHighlight);

  const { IdAttributePlugin, RenderPlugin } = await import('@11ty/eleventy');
  eleventyConfig.addPlugin(IdAttributePlugin);
  eleventyConfig.addPlugin(RenderPlugin);

  eleventyConfig.addPlugin(embedYouTube, { lite: true });
  eleventyConfig.addPlugin(readingTime);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(linkToPlugin);
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3', 'h4', 'h5', 'h6'],
    wrapperClass: 'autotoc indent',
  });

  /* ---------------- Markdown ---------------- */
  const md = markdownIt({ html: true, breaks: true, linkify: true })
    .use(markdownItHeadingLevel, { firstLevel: 2 })
    .use(markdownItFootnote)
    .use(markdownItAnchor, {
      level: [2, 3, 4],
      slugify: s => slugifyFn(s), // sync wrapper
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: 'after',
        visuallyHiddenClass: 'visually-hidden',
        class: 'deeplink',
        symbol: '<svg class="icon"><use xlink:href="#symbol-anchor"/></svg>',
      }),
    })
    .use(markdownItAttrs)
    .use(markdownItSpan)
    .use(markdownItAbbr)
    .use(html5Media)
    .use(markdownItContainer, 'lead')
    .use(markdownItContainer, 'info')
    .use(markdownItContainer, 'success')
    .use(markdownItContainer, 'warning')
    .use(markdownItContainer, 'error');

  eleventyConfig.setLibrary('md', md);
  eleventyConfig.addFilter('markdownify', s => md.render(s));

  /* ---------------- Transforms ---------------- */
  if (process.env.NODE_ENV === 'production') {

  //const { default: ogImage } = require('./src/_11ty/shortcodes/ogImage.mjs');
  
const { default: imagesResponsiverConfig } = await import('./src/_11ty/images-responsiver-config.js');
  
    eleventyConfig.addTransform('imagesResponsiver', async (content, outputPath) =>
      outputPath?.endsWith('.html') ? imagesResponsiver(content, imagesResponsiverConfig) : content
    );

    const { default: mathjaxTransform } = await import('./src/_11ty/transform/mathjaxTransform.js');
    eleventyConfig.addTransform('mathjaxTransform', mathjaxTransform);
  

 eleventyConfig.addTransform('htmlmin', async function(content) {
  if (this.page.outputPath && this.page.outputPath.endsWith('.html')) {
    let minified = await htmlmin.minify(content, {
      // Options: https://github.com/j9t/html-minifier-next?tab=readme-ov-file#options-quick-reference
      collapseBooleanAttributes: true,
      decodeEntities: true,
      minifyCSS: true,
      minifyJS: true,
      preventAttributesEscaping: true,
      removeComments: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
    });
    return minified;
  }
  return content;
});
}
  
  /* ---------------- Passthrough Copy ---------------- */
  eleventyConfig.addPassthroughCopy(`${config.dir.src}/**/*.{jpg,jpeg,png,gif,svg,kmz,zip,css,bib,pdf,webp,mov,woff,ttf,woff2,ico,htm,r,csv,gz}`);
  eleventyConfig.addPassthroughCopy(`${config.dir.src}/assets/**/*.{css,js,htl,r,csv,gz}`);
  eleventyConfig.addPassthroughCopy(`${config.dir.src}/.well-known/*.txt`);
  eleventyConfig.addPassthroughCopy(`${config.dir.src}/.htaccess`);
  eleventyConfig.addPassthroughCopy(`${config.dir.src}/_headers`);
  eleventyConfig.addPassthroughCopy(`${config.dir.src}/opensearch.xml`);
  eleventyConfig.addPassthroughCopy(`${config.dir.src}/manifest.webmanifest`);

  /* ---------------- Final Config ---------------- */
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.setQuietMode(true);

  return {
    templateFormats: ['md', 'njk'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    dir: {
      input: config.dir.src,
      output: config.dir.dist,
      includes: '_includes',
      layouts: '_layouts',
      data: '_data',
    },
  };
}
