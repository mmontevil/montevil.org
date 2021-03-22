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
    './publications/*/202*/*.html',
        './publications/*/sub*/*.html',
    './assets/me/Montevil-192px.png',
    './assets/me/Montevil-512px.png',
    './publications/publicationsbyYear/*.html',
  ],
  runtimeCaching: [
  {
    // MUST be the same as "start_url" in manifest.json
    urlPattern: '/',
    // use NetworkFirst or NetworkOnly if you redirect un-authenticated user to login page
    // use StaleWhileRevalidate if you want to prompt user to reload when new version available
    handler: 'NetworkFirst',
    options: {
      // don't change cache name
      cacheName: 'start-url',
      expiration: {
        maxEntries: 1,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
      }
    }
  },
  {
    urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-font-assets',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      }
    }
  },
  {
    urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-image-assets',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },
  {
    urlPattern: /\.(?:js)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-js-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },
  {
    urlPattern: /\.(?:css|less)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-style-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },,
  {
    urlPattern:  /\.(?:html|\/)$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'htmlpages',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      },
      networkTimeoutSeconds: 10
    }
  },
  {
    urlPattern: /.*/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'others',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      },
      networkTimeoutSeconds: 10
    }
  }
  ],
  //dontCacheBustURLsMatching: new RegExp('.+.[a-f0-9]{8}..+'),
  //swSrc: path.join(DIST, 'service-worker.js'),
  swDest: path.join(DIST, 'service-worker.js'),
};
