const getFilteredCollection = require('../../_utils/filter-collection');

const latestNb = 3;
const promotedNb = 3;

module.exports = {
  chapters: (collection) => {
    return getFilteredCollection(collection, 'chapters');
  },
  latestChapters: (collection) => {
    // latest articles
    return getFilteredCollection(collection, 'chapters').slice(0, latestNb);
  },
  promotedChapters: (collection) => {
    // promoted articles within not the latest ones
    return getFilteredCollection(collection, 'chapters')
      .slice(latestNb)
      .filter((article) => article.data.promoted)
      .slice(0, promotedNb);
  },
};
