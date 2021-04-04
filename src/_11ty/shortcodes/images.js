






module.exports = {
  icon: (id, label) => {
    let svgclass = 'svgnofill';
    if (id == 'pdf' || id == 'bib' || id == 'reference'|| id == 'twitter'|| id == 'academia'|| id == 'researchgate'|| id == 'googlescholar'|| id == 'orcid'|| id == 'github'|| id == 'mastodon'|| id == 'hal') svgclass = 'svgfill';
    return `<svg class="icon ${svgclass}" role="img" aria-label="${label}" focusable="false"><use xlink:href="#symbol-${id}" /></svg>`;
  },
  archiveIllustration: (src, width, height, alt) => {
    let image = `
<img
  alt='${alt}'
  width='${width}'
  height='${height}'
  src='https://res.cloudinary.com/mmontevil/image/fetch/q_auto,f_auto,w_300,c_limit/${src}'
  srcset='`;
    image += [220, 465, 710, 955, 1200]
      .map(
        (resizeWidth) =>
          `https://res.cloudinary.com/mmontevil/image/fetch/q_auto,f_auto,w_${resizeWidth},c_limit/${src} ${resizeWidth}w`
      )
      .join(',');
    image += `'
  sizes='
    (min-width: 67rem) 18rem,
    (min-width: 48rem) calc(0.4 * (90vw - 15rem)),
    (min-width: 40rem) 36vw,
    90vw'
  class='card__illustration'
  crossorigin='anonymous'
  loading='lazy' />
`;
    return image.replace(/\n/g, '\\n');
  },
};
