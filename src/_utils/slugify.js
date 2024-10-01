const slugify1 = require('@sindresorhus/slugify');
//const slugify1 = (...args) => import('@sindresorhus/slugify').then(({default: slugify}) => slugify(...args));
//'use strict';
//import slugify1 from '@sindresorhus/slugify';
//const slugify = require('slugify');
//const slugify1 = (...args) => import('@sindresorhus/slugify').then(({default: slugify}) => slugify(...args));
const memoize = require('fast-memoize');
// slugify is called 1000s of times, let's memoize it

const slugify0 = function(string) {
  return slugify1(string, {
    decamelize: false,
    customReplacements: [['%', ' ']],
  });
}

const slugify = memoize(slugify0);

module.exports = slugify;
