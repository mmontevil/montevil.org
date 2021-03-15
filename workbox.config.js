const path = require('path');

const DIST = '_site';

module.exports = {
  globDirectory: DIST,
  globPatterns: [
    './js/additional-es.*.js',
    './index.html',
    './about/index.html',
    './about/the-website.html',
    './offline.html',
    './offline-fallback.html',
    './manifest.webmanifest',
    './publications/articles/202*/*.html',
    './publications/chapters/202*/*.html',
    './assets/me/Montevil-192px.png',
    './assets/me/Montevil-512px.png'
  ],
  runtimeCaching: [
    {
      // Match any request ends with .png, .jpg, .jpeg or .svg.
      urlPattern: /.(.*)$/,

      // Apply a cache-first strategy.
      handler: "NetworkFirst",

      options: {
        // Use a custom cache name.
        cacheName: "images",

        // Only cache 10 images.
        expiration: {
          maxEntries: 100
        }
      }
    }
  ],
  //dontCacheBustURLsMatching: new RegExp('.+.[a-f0-9]{8}..+'),
  //swSrc: path.join(DIST, 'service-worker.js'),
  swDest: path.join(DIST, 'service-worker.js'),
};
