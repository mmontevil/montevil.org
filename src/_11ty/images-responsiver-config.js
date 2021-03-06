const pkg = require('../../package.json');
const imageSize = require('image-size');
const markdownIt = require('markdown-it');
const md = new markdownIt();

const runBeforeHook = (image, document) => {
  let documentBody = document.querySelector('body');
  let srcPath = documentBody.getAttribute('data-img-src');
  // TODO: get "_site/" from config
  let distPath = documentBody
    .getAttribute('data-img-dist')
    .replace(/^_site/, '');

  let imageSrc = image.getAttribute('src');

  let imageUrl = '';

  if (imageSrc.match(/^(https?:)?\/\//)) {
    // TODO: find a way to get a remote image's dimensions
    // TODO: some images are local but have an absolute URL
    imageUrl = imageSrc;
   var re = /https:\/\/image.thum.io\/get\/width\/(\d*)\/crop\/(\d*)\/noanimate.*/;
    var newstr = parseInt(imageSrc.replace(re, "$1"),10);
     var newstr2 = parseInt(imageSrc.replace(re, "$1"),10);
     if (image.getAttribute('width') === null && newstr>0) {
           image.setAttribute('width', newstr);
    image.setAttribute('height', newstr*newstr2/1000);

    }
       // https://image.thum.io/get/width/(\d*)/crop/(\d*)/noanimate

  } else {
    let imageDimensions;
    if (imageSrc[0] === '/') {
      // TODO: get "src/" from Eleventy config
      imageDimensions = imageSize('./src' + imageSrc);
      imageUrl = pkg.homepage + encodeURI(imageSrc);
    } else {
      // This is a relative URL
      imageDimensions = imageSize(srcPath + imageSrc);
      imageUrl = pkg.homepage + distPath + encodeURI(imageSrc);
    }
     if (image.getAttribute('width') === null) {
    image.setAttribute('width', imageDimensions.width);
     }
    image.setAttribute('height', imageDimensions.height);
    image.setAttribute('src', imageUrl);
  }
  image.dataset.responsiver = image.className;
};

const runAfterHook = (image, document) => {
  let imageUrl =
    image.getAttribute('data-pristine') || image.getAttribute('src');
  let caption = image.getAttribute('title');

  if (caption !== null) {
    caption = md.render(caption.trim());
  }

  let zoom = [...image.classList].indexOf('zoom') !== -1;
 // let img1 = [...image.classList].indexOf('img1') !== -1;
 // let img2 = [...image.classList].indexOf('img2') !== -1;
 // let img3 = [...image.classList].indexOf('img3') !== -1;
//var classs=""
  //if(img1){classs="sub1"; }
  
  if (caption || zoom) {
    const figure = document.createElement('figure');
    figure.classList.add(...image.classList);
    // TODO: decide weither classes should be removed from the image or not
    image.classList.remove(...image.classList);
    let figCaption = document.createElement('figcaption');
    // figCaption.classList.add(classs);
    figCaption.innerHTML =
      (caption ? caption : '') +
      (zoom
        ? `<p class="zoom ">&#128269; See <a href="${imageUrl}">full size</a></p>`
        : '');
    figure.appendChild(image.cloneNode(true));
    figure.appendChild(figCaption);
    image.replaceWith(figure);
  }
};

module.exports = {
  default: {
    selector: ':not(picture) img[src]:not([srcset]):not([src$=".svg"])',
    resizedImageUrl: (src, width) =>
      // https://cloudinary.com/blog/automatic_responsive_images_with_client_hints#comment-3190517665
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
  onehalf: {
    fallbackWidth: 400,
    minWidth: 180,
    maxWidth: 800,
    sizes: '(max-width: 67rem) 45vw, 30rem',
    classes: ['onehalf','img1','img2','img3'],
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
    fallbackWidth: 32,
    minWidth: 32,
    maxWidth: 64,
    steps: 3,
    sizes: '32px',
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
