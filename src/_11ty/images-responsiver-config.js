// image-config.js (ESM)

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { imageSizeFromFile } from 'image-size/fromFile';
import MarkdownIt from 'markdown-it';
import memoize from 'memoize';

// Memoized version
const getImageDimensions = memoize(async (filePath) => {
  return await imageSizeFromFile(filePath);
});
const md = new MarkdownIt();

const pkgPath = path.join(process.cwd(), 'package.json');
const pkgRaw = await fs.readFile(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw);



/* ------------------------------------------------------------------ */
/* BEFORE HOOK                                                         */
/* ------------------------------------------------------------------ */

const runBeforeHook = async (image, document) => {
  const documentBody = document.querySelector('body');

  const srcPath = documentBody.getAttribute('data-img-src');

  // TODO: get "_site/" from config
  const distPath = documentBody
    .getAttribute('data-img-dist')
    .replace(/^\.\/_site/, '');

  let imageSrc = image.getAttribute('src');
  imageSrc = imageSrc.replace(/^_site/, '');

  let imageUrl = '';

  /* -------------------------------------------------------------- */
  /* Remote images                                                  */
  /* -------------------------------------------------------------- */

  if (imageSrc.match(/^(https?:)?\/\//)) {
    imageUrl = imageSrc;

    const re =
      /https:\/\/image.thum.io\/get\/width\/(\d*)\/crop\/(\d*)\/noanimate.*/;

    const width = parseInt(imageSrc.replace(re, '$1'), 10);
    const height = parseInt(imageSrc.replace(re, '$2'), 10);

    if (image.getAttribute('width') === null && width > 0 && height > 0) {
      image.setAttribute('width', width);
      image.setAttribute('height', Math.round((width * height) / 1000));
    }

    image.setAttribute('src', imageUrl);
    image.dataset.responsiver = image.className;
    return;
  }

  /* -------------------------------------------------------------- */
  /* Local images                                                   */
  /* -------------------------------------------------------------- */

  let imageDimensions;
  let statSize = 0;

  if (imageSrc.startsWith('/')) {
    try {
      const stat = await fs.stat('./src' + imageSrc);
      statSize = stat.size;
    } catch {
      statSize = 0;
    }
  }

if (imageSrc.startsWith('/') && statSize > 0) {
  imageDimensions = await getImageDimensions('./src' + imageSrc);
  imageUrl = pkg.homepage + encodeURI(imageSrc);
} else {
  imageDimensions = await getImageDimensions(srcPath + imageSrc);
  imageUrl = pkg.homepage + distPath + encodeURI(imageSrc);
}

  if (image.getAttribute('width') === null) {
    image.setAttribute('width', imageDimensions.width);
    image.setAttribute('height', imageDimensions.height);
  } else {
    image.setAttribute(
      'height',
      Math.round(
        (imageDimensions.height / imageDimensions.width) *
          image.getAttribute('width')
      )
    );
  }

  image.setAttribute('src', imageUrl);
  image.dataset.responsiver = image.className;
};

/* ------------------------------------------------------------------ */
/* AFTER HOOK                                                         */
/* ------------------------------------------------------------------ */

const runAfterHook = async (image, document) => {
  const imageUrl =
    image.getAttribute('data-pristine') || image.getAttribute('src');

  let caption = image.getAttribute('title');
  if (caption !== null) {
    caption = md.render(caption.trim());
  }

  const lightbox = document.createElement('a');
  lightbox.appendChild(image.cloneNode(true));
  lightbox.classList.add('glightbox');

  lightbox.setAttribute(
    'href',
    'https://res.cloudinary.com/mmontevil/image/fetch/q_auto,f_auto/' + imageUrl
  );

  lightbox.setAttribute('aria-label', 'Full size');

  if (image.classList.contains('darkFilter')) {
    lightbox.setAttribute('data-lightbox-classes', 'darkFilter');
  }

  let temp = image.nextSibling;
  let captionFound = false;
  let count = 0;

  while (temp) {
    if (temp.tagName === 'FIGCAPTION') {
      lightbox.setAttribute(
        'data-lightbox-caption',
        escape(temp.innerHTML)
      );
      captionFound = true;
    }

    const prev = temp;
    temp = temp.nextSibling;

    if (
      count === 0 &&
      temp === null &&
      prev?.parentElement?.parentElement?.tagName === 'FIGURE'
    ) {
      temp = prev.parentElement.nextSibling;
      count = 1;
    }
  }

  if (!captionFound && image.getAttribute('alt')) {
    lightbox.setAttribute(
      'data-lightbox-caption',
      image.getAttribute('alt')
    );
  }

  image.replaceWith(lightbox);
};

/* ------------------------------------------------------------------ */
/* EXPORT                                                             */
/* ------------------------------------------------------------------ */

export default {
  default: {
    selector:
      ':not(picture) img[src]:not([srcset]):not([src$=".svg"]):not([src^="https://res.cloudinary.com"])',
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/mmontevil/image/fetch/q_auto,f_auto,w_auto:100:${width},c_limit/${src}`,
    runBefore: runBeforeHook,
    runAfter: runAfterHook,
    fallbackWidth: 800,
    minWidth: 360,
    maxWidth: 1600,
    sizes: '(max-width: 67rem) 90vw, 60rem',
    attributes: {
      loading: 'lazy',
      crossorigin: 'anonymous',
    },
  },

  twothirds: {
    fallbackWidth: 600,
    minWidth: 240,
    maxWidth: 1120,
    sizes: '(max-width: 20rem) 45vw, (max-width: 67rem) 60vw, 40rem',
    classes: ['twothirds'],
  },

  giant: {
    fallbackWidth: 2700,
    minWidth: 2700,
    maxWidth: 2700,
    steps: 1,
    sizes: '2700px',
    classes: ['giant'],
  },

  onehalf: {
    fallbackWidth: 400,
    minWidth: 180,
    maxWidth: 800,
    sizes: '(max-width: 67rem) 45vw, 30rem',
    classes: ['onehalf', 'img1', 'img2', 'img3'],
  },

  onethird: {
    fallbackWidth: 300,
    minWidth: 120,
    maxWidth: 560,
    sizes: '(max-width: 20rem) 45vw, (max-width: 67rem) 30vw, 20rem',
    classes: ['onethird', 'right'],
  },

  onefourth: {
    fallbackWidth: 200,
    minWidth: 100,
    maxWidth: 400,
    sizes:
      '(max-width: 20rem) 45vw, (max-width: 30rem) 30vw, (max-width: 67rem) 22.5vw, 15rem',
    classes: ['onefourth', 'right'],
  },

  avatar: {
    fallbackWidth: 48,
    minWidth: 48,
    maxWidth: 96,
    steps: 3,
    sizes: '48px',
  },

  reaction__author__photo2: {
    fallbackWidth: 48,
    minWidth: 48,
    maxWidth: 96,
    steps: 2,
    sizes: '48px',
  },

  logo: {
    fallbackWidth: 200,
    minWidth: 100,
    maxWidth: 400,
    sizes:
      '(max-width: 20rem) 45vw, (max-width: 30rem) 30vw, (max-width: 67rem) 22.5vw, 15rem',
    figure: 'never',
    classes: ['logo'],
  },

  page__illustration: {
    fallbackWidth: 300,
    minWidth: 220,
    maxWidth: 1200,
    sizes: '(min-width: 67rem) 24rem, (min-width: 40rem) 36vw, 90vw',
  },

  card__illustration: {
    fallbackWidth: 300,
    minWidth: 220,
    maxWidth: 1200,
    sizes:
      '(min-width: 67rem) 18rem, (min-width: 48rem) calc(0.4 * (90vw - 15rem)), (min-width: 40rem) 36vw, 90vw',
  },
};
