const glob = require('fast-glob');
const path = require('path');
const config = require('./pack11ty.config.js');
const { promises: fs } = require('fs');
const syncFs = require('fs');
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");


const { writeToCache, readFromCache } = require('./src/_utils/cache');

cachedPeople = readFromCache('_cache/people.json', (alt = {}));


module.exports = async function (eleventyConfig) {  
  eleventyConfig.on('afterBuild', () => {
    writeToCache(cachedPeople, '_cache/people.json');

  });
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

  glob.sync(path.join(config.dir.src, '_11ty/filters/*js')).forEach((file) => {
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

    
      const { authors } = await import('./src/_11ty/shortcodes2/authors.mjs');
  // Add async filter for authors
  eleventyConfig.addAsyncShortcode(
    'authors',
     async function (name, gsid, people, auth = false, nbAuteurs = 0, fullname) {
       const result = await authors(name, gsid, people, auth, nbAuteurs, fullname);
       // console.log('author filter output:', result);
      return result ;
    });
   
      const {default:addAutoref} = await import('./src/_11ty/shortcodes2/addAutoref.mjs');
	eleventyConfig.addAsyncShortcode("addAutoref", async function (content,bibM) {
    const result = await addAutoref(content,bibM);;
       // console.log('author filter output:', result);
      return result ;
  });
  
     const {renderCitedBy} = await import('./src/_11ty/shortcodes2/authors.mjs');
	eleventyConfig.addAsyncShortcode("renderCitedBy", async function (content,bibM) {
    const result = await renderCitedBy(content,bibM);;
       // console.log('author filter output:', result);
      return result ;
  });
    
  const purge = require('./src/_11ty/purgecss');
  eleventyConfig.addNunjucksAsyncShortcode(
    'purgeCss',
    async function (content, cssFiles) {
      return await purge(content, cssFiles);
    }
  );

  
  
  
  // ------------------------------------------------------------------------
  // Plugins
  // ------------------------------------------------------------------------

  const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
  eleventyConfig.addPlugin(syntaxHighlight);
  
	const { IdAttributePlugin } = await import("@11ty/eleventy");
	eleventyConfig.addPlugin(IdAttributePlugin);
  
  const { RenderPlugin } = await import("@11ty/eleventy");
  eleventyConfig.addPlugin(RenderPlugin);
  /*
eleventyConfig.addPlugin(feedPlugin, {
		type: "rss", // or "rss", "json"
		outputPath: "/feeds/all.xml",
		collection: {
			name: "archivesall", // iterate over `collections.posts`
			limit: 50,     // 0 means no limit
		},
		metadata: {
			language: "en",
			title: "Maël Montévil, research page",
			base: "https://montevil.org/",
			author: {
				name: "Maël Montévil",
			}
		}
	});
*/

 
  const embedYouTube = require("eleventy-plugin-youtube-embed");
  eleventyConfig.addPlugin(embedYouTube, {
      lite: true});

  eleventyConfig.addPlugin(require('eleventy-plugin-link_to'));

  const readingTime = require('eleventy-plugin-reading-time');
  eleventyConfig.addPlugin(readingTime);

  const pluginTOC = require('eleventy-plugin-nesting-toc');

  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3', 'h4', 'h5', 'h6'],
    wrapperClass: ' autotoc indent ',
  });
  const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
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

  const markdownItAnchor = require('markdown-it-anchor');

  const { html5Media } = require('markdown-it-html5-media');
    const { default: slugify } = await import("./src/_utils/slugify.mjs");

    const markdownItAnchorOptions = {
    permalink: markdownItAnchor.permalink.ariaHidden({
      assistiveText: title => `Permalink to “${title}”`,
      placement: 'after',
      visuallyHiddenClass: 'visually-hidden',
        class: 'deeplink',
    symbol:
      '<svg class="icon" role="img" focusable="false" aria-label="Anchor"><use xlink:href="#symbol-anchor" /></svg>'
    }),
    level: [2, 3, 4],
    slugify: async function (s) {
      return await slugify(s);
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
    .use(html5Media)
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

  if (process.env.NODE_ENV === 'production') {
    // const imagesResponsiver = require('eleventy-plugin-images-responsiver');
    const imagesResponsiverConfig = require(path.join(
      __dirname,
      config.dir.src,
      '_11ty/images-responsiver-config.js'
    ));
    const imagesResponsiver = require('./src/_utils/responsiver.js');

    const imagesResponsiverTransform = async (content, outputPath) => {
      if (outputPath && outputPath.endsWith('.html')) {
        return imagesResponsiver(content, imagesResponsiverConfig);
      }
      return content;
    };
    eleventyConfig.addTransform(
      'imagesResponsiver',
      imagesResponsiverTransform
    );


    const mathjax2 = require('./src/_11ty/mathjax.js');

    eleventyConfig.addTransform('mathjax2', mathjax2);

    eleventyConfig.addTransform(`htmlmin`, function (content, outputPath) {
      if (
        outputPath &&
        outputPath.endsWith(`.html`) &&
        !outputPath.endsWith(
          `2011-LM-Biology-Extending-Criticality/index.html`
        ) &&
        !outputPath.endsWith(`xtended/index.html`)
      ) {
        //console.log(outputPath);
        return require(`html-minifier`).minify(content, {
          //  useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          minifyCSS: false,
          collapseInlineTagWhitespace: true,
          collapseBooleanAttributes: true,
          decodeEntities: true,
          includeAutoGeneratedTags: false,
          minifyJS: false,
          minifyURLs: true,
          preventAttributesEscaping: true,
          processConditionalComments: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          trimCustomFragments: true,
          useShortDoctype: true,
        });
      }
      return content;
    });

  }
 // eleventyConfig.addPlugin(UpgradeHelper);

  // ------------------------------------------------------------------------
  // Eleventy configuration
  // ------------------------------------------------------------------------

  // https://github.com/11ty/eleventy/issues/893#issuecomment-606260541
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addWatchTarget('_site/js/');
  eleventyConfig.addWatchTarget('_site/css/');

  eleventyConfig.addPassthroughCopy(
    path.join(
      config.dir.src,
      '**/*.{jpg,jpeg,png,gif,svg,kmz,zip,css,bib,pdf,webp,mov,woff,ttf,woff2,ico,htm,r,csv,gz}'
    )
  ).addPassthroughCopy(path.join(config.dir.src, 'assets**/*.{css,js,htl,r,csv,gz}'))
    .addPassthroughCopy(path.join(config.dir.src, '.well-known/*.{txt}'))
    .addPassthroughCopy(path.join(config.dir.src, '.htaccess'))
    .addPassthroughCopy(path.join(config.dir.src, '_headers'))
    .addPassthroughCopy(path.join(config.dir.src, 'opensearch.xml'))
    .addPassthroughCopy(path.join(config.dir.src, 'manifest.webmanifest'));

  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.setQuietMode(true);



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
