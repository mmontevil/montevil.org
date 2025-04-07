const pkg = require('../../package.json');
const imageSize = require('image-size');
const { imageSizeFromFile } = require('image-size/fromFile')
const markdownIt = require('markdown-it');
const md = new markdownIt();
const fs = require('fs');

const runBeforeHook =async (image, document) => {
  let documentBody = document.querySelector('body');
  let srcPath = documentBody.getAttribute('data-img-src');
  // TODO: get "_site/" from config
  let distPath = documentBody
    .getAttribute('data-img-dist')
    .replace(/^\.\/_site/, '');

  let imageSrc = image.getAttribute('src');
    imageSrc=imageSrc.replace(/^_site/, '');
  let imageUrl = '';

  if (imageSrc.match(/^(https?:)?\/\//)) {
    // TODO: find a way to get a remote image's dimensions
    // TODO: some images are local but have an absolute URL
    imageUrl = imageSrc;
    var re =
      /https:\/\/image.thum.io\/get\/width\/(\d*)\/crop\/(\d*)\/noanimate.*/;
    var newstr = parseInt(imageSrc.replace(re, '$1'), 10);
    var newstr2 = parseInt(imageSrc.replace(re, '$1'), 10);
    if (image.getAttribute('width') === null && newstr > 0) {
      image.setAttribute('width', newstr);
      image.setAttribute('height', Math.round((newstr * newstr2) / 1000));
    }
    // https://image.thum.io/get/width/(\d*)/crop/(\d*)/noanimate
  } else {
    let imageDimensions;
    let temp = 0;
    /*   if(imageSrc.includes('stiegler')){
      console.log(imageSrc)
    }*/
    if (imageSrc[0] === '/') {
      temp = fs.statSync('./src' + imageSrc).size;
    }

    if (imageSrc[0] === '/' && temp > 0) {
      // TODO: get "src/" from Eleventy config
      imageDimensions =await  imageSizeFromFile('./src' + imageSrc);
      imageUrl = pkg.homepage + encodeURI(imageSrc);
    } else {
      // This is a relative URL
      imageDimensions =await imageSizeFromFile(srcPath + imageSrc);
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
  }
  image.dataset.responsiver = image.className;
};

const runAfterHook =async (image, document) => {
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
  let count = 0;
  let temp = image.nextSibling;
  let captionfound = false;
  while (temp) {
    if (temp.tagName == 'FIGCAPTION') {
      lightbox.setAttribute('data-lightbox-caption', escape(temp.innerHTML));
      captionfound = true;
      // temp=undefined;'data-lightbox-classes'
    }
    // }else{
    let temp0 = temp;
    temp = temp.nextSibling;
    // console.log(temp);
    if (
      count == 0 &&
      temp == null &&
      temp0.parentElement.parentElement.tagName == 'FIGURE'
    ) {
      temp = temp0.parentElement.nextSibling;
      count = 1;
      // console.log(temp);
    }
    //}
  }
  if (!captionfound && image.getAttribute('alt'))
    lightbox.setAttribute('data-lightbox-caption', image.getAttribute('alt'));

  image.replaceWith(lightbox);
  
};

module.exports = {
  default: {
    selector:
      ':not(picture) img[src]:not([srcset]):not([src$=".svg"]):not([src^="https://res.cloudinary.com"])',
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
