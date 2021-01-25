import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js/es';
import {
  clearRefinements,
  configure,
  hierarchicalMenu,
  infiniteHits,
  panel,
  poweredBy,
  refinementList,
  searchBox,
  stats,
} from 'instantsearch.js/es/widgets';
import { history } from 'instantsearch.js/es/lib/routers';

const titleize = (string) => {
  if (string === undefined) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// https://stackoverflow.com/a/46851765/717195
const unescapeHtml = (input) => {
  var el = document.createElement('div');
  return input.replace(/\&#?[0-9a-z]+;/gi, function (enc) {
    el.innerHTML = enc;
    return el.innerText;
  });
};

const activateNavItem = (type) => {
  document.querySelectorAll('.navigation li').forEach((li) => {
    const link = li.querySelectorAll(`a[href="/${type}/"]`);
    // TODO: also update ARIA
    if (link.length === 1) {
      li.classList.add('current');
    } else {
      li.classList.remove('current');
    }
  });
};

const responsiver = (src, width, height, alt) => {
  let image = `
<img
  alt="${alt}"
  width="${width}"
  height="${height}"
  src="https://res.cloudinary.com/montevil/image/fetch/q_auto,f_auto,w_300,c_limit/${src}"
  srcset="`;
  image += [220, 465, 710, 955, 1200]
    .map(
      (resizeWidth) =>
        `https://res.cloudinary.com/montevil/image/fetch/q_auto,f_auto,w_${resizeWidth},c_limit/${src} ${resizeWidth}w`
    )
    .join(',');
  image += `"
  sizes="
    (min-width: 67rem) 18rem,
    (min-width: 48rem) calc(0.4 * (90vw - 15rem)),
    (min-width: 40rem) 36vw,
    90vw"
  class="card__illustration"
  crossorigin="anonymous"
  loading="lazy" />
`;
  return image;
};

const search = instantsearch({
  indexName: process.env.ALGOLIA_INDEX_NAME,
  searchClient: algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_READ_ONLY_API_KEY
  ),
  routing: {
    router: history({
      windowTitle({ type, query }) {
        let typeSlug = 'archives';
        let title = '';
        if (query) {
          title += `Search for "${query}"`;
          if (type !== undefined && type.length === 1) {
            typeSlug = type[0];
            title += ` in ${type[0]}`;
          } else {
            title += ' in archives';
          }
        } else {
          if (type !== undefined && type.length === 1) {
            typeSlug = type[0];
            title += titleize(type[0]);
          } else {
            title += 'Archives';
          }
        }
        window.document.querySelector('h1').innerText = title;
        title += ' - Maël Montévil';

        activateNavItem(typeSlug);

        return title;
      },
      createURL({ qsModule, routeState, location }) {
        const queryParameters = {};

        let urlPath = 'archives';
        if (routeState.type !== undefined) {
          switch (routeState.type.length) {
            case 0:
              break;
            case 1:
              urlPath = routeState.type[0];
              break;
            default:
              queryParameters.type = routeState.type;
          }
        }
        if (routeState.date !== undefined) {
          urlPath += `/${routeState.date.replace('-', '/')}`;
        }
        if (routeState.query) {
          queryParameters.query = encodeURIComponent(routeState.query);
        }
        if (routeState.page && routeState.page !== 1) {
          queryParameters.page = routeState.page;
        }
        if (routeState.lang && routeState.lang.length > 0) {
          queryParameters.lang = routeState.lang;
        }
        if (routeState.tags && routeState.tags.length > 0) {
          queryParameters.tags = routeState.tags;
        }

        const queryString = qsModule.stringify(queryParameters, {
          addQueryPrefix: true,
          arrayFormat: 'repeat',
        });

        return `/${urlPath}/${queryString}`;
      },

      parseURL({ qsModule, location }) {
        const urlParts = {};

        // Parse location path
        const matches = location.pathname.match(
          /\/([a-z]+)\/(?:([0-9]{4})\/)?(?:([0-9]{2})\/)?$/
        );
        if (matches[1] !== undefined && matches[1] !== 'archives') {
          urlParts.type = [matches[1]];
        }
        if (matches[2] !== undefined) {
          urlParts.date = matches[2];
        }
        if (matches[3] !== undefined) {
          urlParts.date += '-' + matches[3];
        }

        // Parse query string
        const queryParts = qsModule.parse(location.search.slice(1));
        if (queryParts.query !== undefined && queryParts.query !== '') {
          urlParts.query = decodeURIComponent(queryParts.query);
        }
        if (queryParts.page !== undefined && queryParts.page !== 1) {
          urlParts.page = queryParts.page;
        }
        ['type', 'lang', 'tags'].forEach((refinement) => {
          if (
            typeof queryParts[refinement] === 'string' &&
            queryParts[refinement] !== ''
          ) {
            urlParts[refinement] = [queryParts[refinement]];
          }
          if (
            Array.isArray(queryParts[refinement]) &&
            queryParts[refinement].length > 0
          ) {
            urlParts[refinement] = queryParts[refinement];
          }
        });
        return urlParts;
      },
    }),
    stateMapping: {
      routeToState(routeState) {
        const state = { montevil: {} };
        if (routeState.query !== undefined && routeState.query !== '') {
          state.montevil.query = routeState.query;
        }
        if (routeState.page !== undefined && routeState.page !== 1) {
          state.montevil.page = routeState.page;
        }
        ['type', 'lang', 'tags'].forEach((refinement) => {
          if (
            routeState[refinement] !== undefined &&
            routeState[refinement].length > 0
          ) {
            if (state.montevil.refinementList === undefined) {
              state.montevil.refinementList = {};
            }
            state.montevil.refinementList[refinement] = routeState[refinement];
          }
        });
        if (routeState.date !== undefined && routeState.date.length > 0) {
          state.montevil.hierarchicalMenu = {
            'date.lvl0': routeState.date.split('-'),
          };
        }
        return state;
      },
      stateToRoute(uiState) {
        const route = {};
        if (uiState['montevil'].query !== undefined && uiState['montevil'].query !== '') {
          route.query = uiState['montevil'].query;
        }
        if (uiState['montevil'].page !== undefined && uiState['montevil'].page !== 1) {
          route.page = uiState['montevil'].page;
        }
        if (uiState['montevil'].refinementList !== undefined) {
          ['type', 'lang', 'tags'].forEach((refinement) => {
            if (
              uiState.montevil.refinementList[refinement] !== undefined &&
              uiState.montevil.refinementList[refinement].length !== 0
            ) {
              route[refinement] = uiState.montevil.refinementList[refinement];
            }
          });
        }
        if (
          uiState.montevil.hierarchicalMenu !== undefined &&
          uiState.montevil.hierarchicalMenu['date.lvl0'] !== undefined &&
          uiState.montevil.hierarchicalMenu['date.lvl0'].length !== 0
        ) {
          route.date = uiState.montevil.hierarchicalMenu['date.lvl0'].join('-');
        }
        return route;
      },
    },
  },
});

const typesPanel = panel({
  templates: {
    header: 'Types',
  },
  hidden: ({ results }) => results.getFacetValues('type').length === 0,
})(refinementList);

const tagsPanel = panel({
  templates: {
    header: 'Tags',
  },
  hidden: ({ results }) => results.getFacetValues('tags').length === 0,
})(refinementList);

const datesPanel = panel({
  templates: {
    header: 'Dates',
  },
  hidden: ({ results }) => {
    return results.getFacetValues('date.lvl0').data === null;
  },
})(hierarchicalMenu);

const languagesPanel = panel({
  templates: {
    header: 'Languages',
  },
  hidden: ({ results }) => results.getFacetValues('lang').length === 0,
})(refinementList);

search.addWidgets([
  searchBox({
    container: '#searchbox',
    placeholder: 'Search for content…',
    autofocus: true,
    showSubmit: false,
  }),
  clearRefinements({
    container: '#clear-refinements',
    templates: {
      resetLabel: 'Clear filters',
    },
  }),
  stats({
    container: '#stats',
  }),
  poweredBy({
    container: '#powered-by',
  }),
  typesPanel({
    container: '#types-list',
    attribute: 'type',
    sortBy: ['name:asc'],
  }),
  tagsPanel({
    container: '#tags-list',
    attribute: 'tags',
    sortBy: ['count:desc', 'name:asc'],
    operator: 'and',
    showMore: true,
    showMoreLimit: 100,
    searchable: true,
  }),
  datesPanel({
    container: '#dates-menu',
    attributes: ['date.lvl0', 'date.lvl1', 'date.lvl2'],
    limit: 5,
    showMore: true,
    showMoreLimit: 100,
    sortBy: ['name:desc'],
    templates: {
      item: `
      <a class="{{cssClasses.link}}" href="{{url}}">{{label}}</a>
      <span class="{{cssClasses.count}}">{{count}}</span>
    `,
    },
  }),
  languagesPanel({
    container: '#langs-list',
    attribute: 'lang',
    sortBy: ['name:asc'],
  }),
  infiniteHits({
    container: '#hits',
    templates: {
      item(hit) {
         console.log(
           `${hit.title}\n -> matchLevel ${hit._snippetResult.content.matchLevel}`
         );
        return (
          `<article class="card ${hit.type} h-entry" lang="${hit.lang}">` +
          (hit.illustration
            ? responsiver(
                hit.illustration.src,
                hit.illustration.width,
                hit.illustration.height,
                hit.illustration.alt
              )
            : '') +
          (hit.surtitle
            ? '<p class="card__surtitle">' +
              unescapeHtml(
                instantsearch.highlight({
                  attribute: 'surtitle',
                  hit,
                })
              ) +
              '</p>'
            : '') +
          (hit.title
            ? `<p class="card__title"><a href="${
                hit.url
              }">${instantsearch.highlight({
                attribute: 'title',
                hit,
              })}</a></p>`
            : '') +
          `${
            hit._snippetResult.content.matchLevel !== 'none'
              ? '<div class="card__body p-summary">' +
                hit._snippetResult.content.value +
                '</div>'
              : '<div class="card__body p-summary">' + hit.excerpt + '</div>'
          }` +
          (hit.meta_html
            ? `
${hit.meta_html}`
            : '') +
          '</article>'
        );
      },
    },
  }),
  configure({
    hitsPerPage: 10,
  }),
]);

search.start();

// TODO: handle navigation as type selection and other facets reset
// document
//   .querySelectorAll(
//     '.navigation a[href="/articles/"], .navigation a[href="/links/"], .navigation a[href="/notes/"], .navigation a[href="/talks/"], .navigation a[href="/archives/"]'
//   )
//   .forEach((navigationItem) => {
//     navigationItem.addEventListener('click', (event) => {
//       event.preventDefault();
//       const type = event.originalTarget.pathname.split('/')[1];
//       const refinementItem = document.querySelector(
//         `#types-list .ais-RefinementList-checkbox[value="${type}"]`
//       );
//       const clickEvent = new Event('click');
//       refinementItem.dispatchEvent(clickEvent);
//       // search.setUiState({
//       //   refinementList: {
//       //     type: [type],
//       //   },
//       //   page: 1,
//       // });
//       // TODO: change active navigation item
//     });
//   });
