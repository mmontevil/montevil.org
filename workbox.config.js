const path = require('path');

const DIST = '_site';

module.exports = {
  globDirectory: DIST,
  globPatterns: [
    './js/additional-es.*.js',
    './index.html',
    './about/',
    './about/the-website.html',
    './offline.html',
    './offline-fallback.html',
    './manifest.webmanifest',
    './publications/articles/2020*.html',
    './publications/chapter/2020*.html',
    './assets/me/Montevil-192px.png',
    './assets/me/Montevil-512px.png'
  ],
  //dontCacheBustURLsMatching: new RegExp('.+.[a-f0-9]{8}..+'),
  //swSrc: path.join(DIST, 'service-worker.js'),
  swDest: path.join(DIST, 'service-worker.js'),
};
