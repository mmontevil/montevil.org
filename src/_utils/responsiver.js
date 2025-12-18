'use strict';import { DOMParser } from 'linkedom';
import deepmerge from 'deepmerge';
import clonedeep from 'lodash.clonedeep';
import debug from 'debug';
import memoize from 'memoize';
import { imageSizeFromFile } from 'image-size/fromFile';
import fs from 'fs/promises';
import path from 'path';

const error = debug('images-responsiver:error');
const warning = debug('images-responsiver:warning');
const info = debug('images-responsiver:info');

// Memoized image dimensions
const getImageDimensions = memoize(async (filePath) => {
  try {
    await fs.access(filePath);
    return await imageSizeFromFile(filePath);
  } catch (err) {
    warning(`Could not read image dimensions for ${filePath}: ${err.message}`);
    return { width: 0, height: 0, type: 'unknown' };
  }
});

const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

const defaultSettings = {
  selector: ':not(picture) > img[src]:not([srcset]):not([src$=".svg"])',
  resizedImageUrl: (src, width) => src.replace(/^(.*)(\.[^\.]+)$/, `$1-${width}$2`),
  runBefore: async (image) => image,
  runAfter: async (image) => image,
  fallbackWidth: 640,
  minWidth: 320,
  maxWidth: 1280,
  steps: 5,
  sizes: '100vw',
  classes: [],
  attributes: {},
};

function createDocumentFromHTML(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

const imagesResponsiver = async (html, options = {}) => {
  let globalSettings = defaultSettings;

  if (options.default !== undefined) {
    globalSettings = deepmerge(globalSettings, options.default, {
      arrayMerge: overwriteMerge,
    });
  }

  const document = createDocumentFromHTML(html);
  const images = [...document.querySelectorAll(globalSettings.selector)].filter(
    (img) => img.getAttribute('src') !== null && !img.getAttribute('srcset')
  );

  for (const image of images) {
    let imageSettings = clonedeep(globalSettings);

    // Run async before hook
    await imageSettings.runBefore(image, document);

    // Merge presets based on classes
    if ('responsiver' in image.dataset) {
      image.dataset.responsiver.split(' ').forEach((preset) => {
        if (options[preset] !== undefined) {
          if ('selector' in options[preset]) {
            error(`'selector' can't be used in preset '${preset}'`);
            delete options[preset].selector;
          }
          const presetClasses = options[preset].classes || [];
          const existingClasses = imageSettings.classes;
          imageSettings = deepmerge(imageSettings, options[preset], {
            arrayMerge: overwriteMerge,
          });
          imageSettings.classes = [...existingClasses, ...presetClasses];
        }
      });
      delete image.dataset.responsiver;
    }

    const imageSrc = image.getAttribute('src');
    info(`Transforming ${imageSrc}`);

    // Example: use memoized getImageDimensions for local images
    if (!imageSrc.startsWith('http')) {
      const filePath = path.join(process.cwd(), imageSrc.replace(/^_site\//, 'src/'));
      const dims = await getImageDimensions(filePath);
      if (!image.getAttribute('width')) image.setAttribute('width', dims.width);
      if (!image.getAttribute('height')) image.setAttribute('height', dims.height);
    }

    // Generate srcset
    let srcsetList = [];
    for (let i = 0; i < imageSettings.steps; i++) {
      const stepWidth = Math.ceil(
        imageSettings.minWidth +
          ((imageSettings.maxWidth - imageSettings.minWidth) / (imageSettings.steps - 1)) * i
      );
      srcsetList.push(`${imageSettings.resizedImageUrl(imageSrc, stepWidth)} ${stepWidth}w`);
    }

    // Apply settings
    if (imageSettings.classes.length > 0) image.classList.add(...imageSettings.classes);
    image.setAttribute('src', imageSettings.resizedImageUrl(imageSrc, imageSettings.fallbackWidth));
    image.setAttribute('srcset', srcsetList.join(', '));
    image.setAttribute('sizes', imageSettings.sizes);
    image.dataset.pristine = imageSrc;

    Object.entries(imageSettings.attributes).forEach(([attr, val]) => {
      if (val !== null) image.setAttribute(attr, val);
    });

    // Run async after hook
    await imageSettings.runAfter(image, document);
  }

  return document.toString();
};

export default imagesResponsiver;

