const slugify = require('@sindresorhus/slugify');
//const slugify = (...args) => import('@sindresorhus/slugify').then(({default: slugify}) => slugify(...args));

//import slugify from '@sindresorhus/slugify';
//const slugify = require('slugify');

const memoize = require('fast-memoize');
// slugify is called 1000s of times, let's memoize it

const slugify0 = (string) =>
  slugify(string, {
    decamelize: false,
    customReplacements: [['%', ' ']],
  });

module.exports = memoize(slugify0);
