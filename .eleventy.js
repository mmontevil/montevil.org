const glob = require('fast-glob');
const path = require('path');
const config = require('./pack11ty.config.js');


module.exports = function (eleventyConfig) {
  // ------------------------------------------------------------------------
  // Collections
  // ------------------------------------------------------------------------
eleventyConfig.setDataDeepMerge(true);
  glob
    .sync(path.join(config.dir.src, '_11ty/collections/*.js'))
    .forEach((file) => {
      let collection = require('./' + file);
      Object.keys(collection).forEach((name) => {
        eleventyConfig.addCollection(name, collection[name]);
      });
    });

  // ------------------------------------------------------------------------
  // Filters
  // ------------------------------------------------------------------------

  glob.sync(path.join(config.dir.src, '_11ty/filters/*.js')).forEach((file) => {
    let filters = require('./' + file);
    Object.keys(filters).forEach((name) => {
      eleventyConfig.addFilter(name, filters[name]);
    });
  });

  // ------------------------------------------------------------------------
  // Shortcodes
  // ------------------------------------------------------------------------

  glob
    .sync(path.join(config.dir.src, '_11ty/shortcodes/*.js'))
    .forEach((file) => {
      let shortcodes = require('./' + file);
      Object.keys(shortcodes).forEach((name) => {
        eleventyConfig.addNunjucksShortcode(name, shortcodes[name]);
      });
    });

  glob
    .sync(path.join(config.dir.src, '_11ty/pairedShortcodes/*.js'))
    .forEach((file) => {
      let pairedShortcodes = require('./' + file);
      Object.keys(pairedShortcodes).forEach((name) => {
        eleventyConfig.addPairedShortcode(name, pairedShortcodes[name]);
      });
    });

  
  // ------------------------------------------------------------------------
  // Plugins
  // ------------------------------------------------------------------------

  const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
  eleventyConfig.addPlugin(syntaxHighlight);

  const rss = require('@11ty/eleventy-plugin-rss');
  eleventyConfig.addPlugin(rss);

  const embedTweets = require('eleventy-plugin-embed-tweet');
  eleventyConfig.addPlugin(embedTweets, {
    cacheDirectory: '_cache',
    useInlineStyles: false,
    autoEmbed: true,
  });

  const embedEverythingElse = require('eleventy-plugin-embed-everything');
  eleventyConfig.addPlugin(embedEverythingElse, {
    youtube: {
      options: {
        lite: {
          css: {
            path: '/assets/javascript/vendors/yt-lite/lite-yt-embed.css',
          },
          js: {
            path: '/assets/javascript/vendors/yt-lite/lite-yt-embed.js',
          },
        },
      },
    },
  });

  eleventyConfig.addPlugin(require('eleventy-plugin-link_to'));
  
const readingTime = require('eleventy-plugin-reading-time');
  
eleventyConfig.addPlugin(readingTime);


const pluginTOC = require('eleventy-plugin-nesting-toc')
 
  eleventyConfig.addPlugin(pluginTOC,{tags:['h2','h3', 'h4', 'h5', 'h6'], wrapperClass:' autotoc indent '})
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
  eleventyConfig.addPlugin(eleventyNavigationPlugin);


  // ------------------------------------------------------------------------
  // Markdown plugins
  // ------------------------------------------------------------------------

  const markdownIt = require('markdown-it');
  const markdownItOptions = {
    html: true,
    breaks: true,
    linkify: true,
  };

  const markdownItFootnote = require('markdown-it-footnote');

  const slugify = require('@sindresorhus/slugify');
  const markdownItAnchor = require('markdown-it-anchor');
  const markdownItAnchorOptions = {
    permalink: true,
    permalinkClass: 'deeplink',
    permalinkSymbol:
      '<svg class="icon" role="img" focusable="false" aria-label="Anchor"><use xlink:href="#symbol-anchor" /></svg>',
    level: [2, 3, 4],
    slugify: function (s) {
      return slugify(s);
    },
  };

  const markdownItAttributes = require('markdown-it-attrs');

  const markdownItSpan = require('markdown-it-bracketed-spans');

  const markdownItContainer = require('markdown-it-container');

  const markdownItAbbr = require('markdown-it-abbr');

  // taken from https://gist.github.com/rodneyrehm/4feec9af8a8635f7de7cb1754f146a39
  function getHeadingLevel(tagName) {
    if (tagName[0].toLowerCase() === 'h') {
      tagName = tagName.slice(1);
    }

    return parseInt(tagName, 10);
  }

  function markdownItHeadingLevel(md, options) {
    var firstLevel = options.firstLevel;

    if (typeof firstLevel === 'string') {
      firstLevel = getHeadingLevel(firstLevel);
    }

    if (!firstLevel || isNaN(firstLevel)) {
      return;
    }

    var levelOffset = firstLevel - 1;
    if (levelOffset < 1 || levelOffset > 6) {
      return;
    }

    md.core.ruler.push('adjust-heading-levels', function (state) {
      var tokens = state.tokens;
      for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].type !== 'heading_close') {
          continue;
        }

        var headingOpen = tokens[i - 2];
        var headingClose = tokens[i];

        var currentLevel = getHeadingLevel(headingOpen.tag);
        var tagName = 'h' + Math.min(currentLevel + levelOffset, 6);

        headingOpen.tag = tagName;
        headingClose.tag = tagName;
      }
    });
  }

  const md = markdownIt(markdownItOptions)
    // .disable('code')
    .use(markdownItHeadingLevel, { firstLevel: 2 })
    .use(markdownItFootnote)
    .use(markdownItAnchor, markdownItAnchorOptions)
    .use(markdownItAttributes)
    .use(markdownItSpan)
    .use(markdownItAbbr)
    .use(markdownItContainer, 'lead') // Chapô in French
    .use(markdownItContainer, 'info')
    .use(markdownItContainer, 'success')
    .use(markdownItContainer, 'warning')
    .use(markdownItContainer, 'error');
  eleventyConfig.setLibrary('md', md);

  // Add markdownify filter with Markdown-it configuration
  eleventyConfig.addFilter('markdownify', (markdownString) =>
    md.render(markdownString)
  );

  // ------------------------------------------------------------------------
  // Transforms
  // ------------------------------------------------------------------------

  if (process.env.NODE_ENV === 'production' ){
   // const imagesResponsiver = require('eleventy-plugin-images-responsiver');
    const imagesResponsiverConfig = require(path.join(
      __dirname,
      config.dir.src,
      '_11ty/images-responsiver-config.js'
    ));
    const imagesResponsiver = require('images-responsiver');
const unescape = require('html-escaper').unescape;


const imagesResponsiverTransform = (content, outputPath) => {
  if (outputPath && outputPath.endsWith('.html')) {
    return (imagesResponsiver(content, imagesResponsiverConfig));
  }
  return content;
};
  eleventyConfig.addTransform(
      'imagesResponsiver',
      imagesResponsiverTransform
    );
  
   /*
  const typesetPlugin = require('eleventy-plugin-typeset');
  
  eleventyConfig.addPlugin(
  typesetPlugin({
    only: '.article-text', // Run only on HTML content within a certain CSS selector
    disable: ['ligatures'], // Disable typesetting feature 'smallCaps'
    // etc.
  })
);*/
 const options = {
  disable: ['ligatures'] // array of typeset feature(s) to disable
};
const typeset = require('typeset');
const typeseter = (content, outputPath) => {
  if (outputPath && outputPath.endsWith('.html')) {
    return typeset(content,options);
  }
  return content;
};
 /* eleventyConfig.addTransform(
      'typeseter',
      typeseter
    ); */
 

const mathjax2 = async (content, outputPath) => {

  if (outputPath && outputPath.endsWith('.html') && outputPath.includes('publications') && (outputPath.includes('articles')  || outputPath.includes('chapters'))  && (content.includes("<!--CompileMaths-->" ))) {
    
const {mathjax} = require('mathjax-full/js/mathjax.js');
const {MathML} = require('mathjax-full/js/input/mathml.js');
const {CHTML} = require('mathjax-full/js/output/chtml.js');
const {liteAdaptor} = require('mathjax-full/js/adaptors/liteAdaptor.js');
const {RegisterHTMLHandler} = require('mathjax-full/js/handlers/html.js');
const {AssistiveMmlHandler} = require('mathjax-full/js/a11y/assistive-mml.js');

require('mathjax-full/js/util/entities/all.js');

const adaptor = liteAdaptor({fontSize: 16});
AssistiveMmlHandler(RegisterHTMLHandler(adaptor));

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
 //
  return  adaptor.doctype(html.document)+adaptor.outerHTML(adaptor.root(html.document));;
    
  }
  return content;
};
 eleventyConfig.addTransform(
      'mathjax2',
      mathjax2
    ); 
 /*
  const eleventyPluginFilesMinifier = require("@sherby/eleventy-plugin-files-minifier");
module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(eleventyPluginFilesMinifier);
};*//*const htmlmin = require("html-minifier");
    eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if( outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
   //     minifyCSS: true,
    //    minifyJS: true,
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified.replaceAll('\n',' ');
    }
    return content;
  });*/
  // eleventyConfig.addPlugin(imagesResponsiver, imagesResponsiverConfig);

    // const htmlMinTransform = require(path.join(
    //   __dirname,
    //   config.dir.src,
    //   '_transforms/html-min-transform.js'
    // ));
    // eleventyConfig.addTransform('htmlmin', htmlMinTransform);
  }

  // ------------------------------------------------------------------------
  // Eleventy configuration
  // ------------------------------------------------------------------------

  // https://github.com/11ty/eleventy/issues/893#issuecomment-606260541
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addWatchTarget('_site/js/');
  eleventyConfig.addWatchTarget('_site/css/');

  eleventyConfig
    .addPassthroughCopy(
      path.join(config.dir.src, '**/*.{jpg,png,gif,svg,kmz,zip,css,bib,pdf,webp,mov}')
    )
    .addPassthroughCopy(path.join(config.dir.src, 'assets'))
    .addPassthroughCopy(path.join(config.dir.src, '.well-known'))
    .addPassthroughCopy(path.join(config.dir.src, '.htaccess'))
    .addPassthroughCopy(path.join(config.dir.src, '_headers'))
    .addPassthroughCopy(path.join(config.dir.src, 'opensearch.xml'))
    .addPassthroughCopy(path.join(config.dir.src, 'manifest.webmanifest'));

  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.setQuietMode(true);

  eleventyConfig.setBrowserSyncConfig({
    ui: false,
    ghostMode: false,
    files: ['_site/css/*.css', '_site/js/*.js'],
  });

  return {
    templateFormats: ['md', 'njk'],

    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      output: config.dir.dist,
      input: config.dir.src,
      includes: '_includes',
      layouts: '_layouts',
      data: '_data',
    },
  };
};
