const getFilteredCollection = require('../../_utils/filter-collection');

const latestNb = 3;
const promotedNb = 3;

module.exports = {
  publications: (collection) => {
    return getFilteredCollection(collection, 'publications');
  },
  latestPublications: (collection) => {
    // latest articles
    return getFilteredCollection(collection, 'publications').slice(0, latestNb);
  },
  promotedPublications: (collection) => {
    // promoted articles within not the latest ones
    return getFilteredCollection(collection, 'publications')
      .slice(latestNb)
      .filter((publication) => publication.data.promoted)
      .slice(0, promotedNb);
  },
};
