'use strict';

import { DOMParser } from 'linkedom';
import deepmerge from 'deepmerge';
import clonedeep from 'lodash.clonedeep';
import debug from 'debug';

const error = debug('images-responsiver:error');
const warning = debug('images-responsiver:warning');
const info = debug('images-responsiver:info');

const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

const defaultSettings = {
  selector: ':not(picture) > img[src]:not([srcset]):not([src$=".svg"])',
  resizedImageUrl: (src, width) =>
    src.replace(/^(.*)(\.[^\.]+)$/, `$1-${width}$2`),
  runBefore: (image) => image,
  runAfter: (image) => image,
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

const imagesResponsiver =  (html, options = {}) => {
  // Default settings
  let globalSettings = defaultSettings;

  // Override default settings with a "default" preset
  if (options.default !== undefined) {
    globalSettings = deepmerge(globalSettings, options.default, {
      arrayMerge: overwriteMerge,
    });
  }

  const document = createDocumentFromHTML(html);

  [...document.querySelectorAll(globalSettings.selector)]
    .filter((image) => {
      return (
        image.getAttribute('src') !== null &&
        !image.getAttribute('src').endsWith('.svg') &&
        image.getAttribute('srcset') === null
      );
    })
    .forEach((image) => {
      let imageSettings = clonedeep(globalSettings);

      imageSettings.runBefore(image, document);

      // Override settings with presets named in the image classes
      if ('responsiver' in image.dataset) {
        image.dataset.responsiver.split(' ').forEach((preset) => {
          if (options[preset] !== undefined) {
            if ('selector' in options[preset]) {
              error(
                `The 'selector' property can't be used in the '${preset}' preset. It can be used only in the 'default' preset`
              );
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

      const imageWidth = image.getAttribute('width');
      if (!imageWidth) {
        warning(`The image should have a width attribute: ${imageSrc}`);
      }

      let srcsetList = [];

      if (imageSettings.widthsList?.length > 0) {
        imageSettings.widthsList = [...new Set(imageSettings.widthsList)].sort(
          (a, b) => a - b
        );
        const widthsListLength = imageSettings.widthsList.length;
        if (imageWidth) {
          imageSettings.widthsList = imageSettings.widthsList.filter(
            (w) => w <= imageWidth
          );
          if (
            imageSettings.widthsList.length < widthsListLength &&
            (imageSettings.widthsList.length === 0 ||
              imageSettings.widthsList.at(-1) !== imageWidth)
          ) {
            imageSettings.widthsList.push(imageWidth);
          }
        }
        srcsetList = imageSettings.widthsList.map(
          (w) => `${imageSettings.resizedImageUrl(imageSrc, w)} ${w}w`
        );
      } else {
        if (imageSettings.steps < 2) {
          warning(`Steps should be >= 2: ${imageSettings.steps} step for ${imageSrc}`);
          imageSettings.steps = 2;
        }

        if (imageSettings.minWidth > imageSettings.maxWidth) {
          warning(`Combined options have minWidth > maxWidth for ${imageSrc}`);
          [imageSettings.minWidth, imageSettings.maxWidth] = [
            imageSettings.maxWidth,
            imageSettings.minWidth,
          ];
        }

        if (imageWidth) {
          if (imageWidth < imageSettings.minWidth) imageSettings.minWidth = imageWidth;
          if (imageWidth < imageSettings.fallbackWidth) imageSettings.fallbackWidth = imageWidth;
        }

        let previousStepWidth = 0;
        for (let i = 0; i < imageSettings.steps; i++) {
          const stepWidth = Math.ceil(
            imageSettings.minWidth +
              ((imageSettings.maxWidth - imageSettings.minWidth) / (imageSettings.steps - 1)) *
                i
          );
          if (imageWidth && stepWidth >= imageWidth) {
            warning(`The image is smaller than maxWidth: ${imageWidth} < ${imageSettings.maxWidth}`);
            srcsetList.push(`${imageSettings.resizedImageUrl(imageSrc, imageWidth)} ${imageWidth}w`);
            break;
          }
          if (stepWidth === previousStepWidth) continue;
          previousStepWidth = stepWidth;
          srcsetList.push(`${imageSettings.resizedImageUrl(imageSrc, stepWidth)} ${stepWidth}w`);
        }
      }

      if (imageSettings.classes.length > 0) image.classList.add(...imageSettings.classes);

      image.setAttribute(
        'src',
        imageSettings.resizedImageUrl(imageSrc, imageSettings.fallbackWidth)
      );
      image.setAttribute('srcset', srcsetList.join(', '));
      image.setAttribute('sizes', imageSettings.sizes);
      image.dataset.pristine = imageSrc;

      Object.entries(imageSettings.attributes).forEach(([attr, val]) => {
        if (val !== null) image.setAttribute(attr, val);
      });

      imageSettings.runAfter(image, document);
    });

  return document.toString();
};

export default imagesResponsiver;
