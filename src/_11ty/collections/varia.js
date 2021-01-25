const getFilteredCollection = require('../../_utils/filter-collection');

const latestNb = 3;
const promotedNb = 3;

module.exports = {
  varia: (collection) => {
    return getFilteredCollection(collection, 'varia');
  },
  latestVaria: (collection) => {
    // latest articles
    return getFilteredCollection(collection, 'varia').slice(0, latestNb);
  },
  promotedVaria: (collection) => {
    // promoted articles within not the latest ones
    return getFilteredCollection(collection, 'varia')
      .slice(latestNb)
      .filter((article) => article.data.promoted)
      .slice(0, promotedNb);
  },
};
