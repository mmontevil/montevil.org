const slugify = require('@sindresorhus/slugify');
//import slugify from '@sindresorhus/slugify';
const memoize = require('fast-memoize');
// slugify is called 1000s of times, let's memoize it

slugify0 = (string) =>
  slugify(string, {
    decamelize: false,
    customReplacements: [['%', ' ']],
  });

module.exports = memoize(slugify0);
