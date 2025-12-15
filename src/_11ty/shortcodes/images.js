export default function icon(id, label) {
  let svgclass = 'svgnofill';

  if (
    id === 'rss' ||
    id === 'user' ||
    id === 'thumb' ||
    id === 'date'
  ) {
    svgclass = 'svgnofill svgup';
  }

  if (
    id === 'pdf' ||
    id === 'bib' ||
    id === 'reference' ||
    id === 'twitter' ||
    id === 'academia' ||
    id === 'researchgate' ||
    id === 'googlescholar' ||
    id === 'orcid' ||
    id === 'github' ||
    id === 'mastodon' ||
    id === 'hal'
  ) {
    svgclass = 'svgfill';
  }

  if (id === 'pdf' || id === 'bib') {
    svgclass = 'svgfill svgfillL';
  }

  return `<svg class="icon ${svgclass}" role="img" aria-label="${label}" focusable="false"><use xlink:href="#symbol-${id}" /></svg>`;
}
