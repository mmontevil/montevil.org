import {DOMParser, parseHTML} from 'linkedom';

export default async function addAnchordom(html) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const selector = 'h2[id],h3[id],h4[id],h5[id],h6[id]';
  [...document.querySelectorAll(selector)].forEach((title) => {
    const titleId = title.getAttribute('id');

    const link = document.createElement('a');
    link.classList.add('deeplink');
    link.setAttribute('href', '#' + titleId);
     link.setAttribute('aria-hidden', 'true');
    link.innerHTML =
      '<svg class="icon" role="img" focusable="false" aria-label="Anchor"><use xlink:href="#symbol-anchor" /></svg>';
    title.appendChild(link);
  });

  return document.toString();

}

