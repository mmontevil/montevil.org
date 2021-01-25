const getFilteredCollection = require('../../_utils/filter-collection');

const latestNb = 3;
const promotedNb = 3;

module.exports = {
  "peer-reviewed": (collection) => {
    return getFilteredCollection(collection, 'peer-reviewed');
  },
  latestPeerreviewed: (collection) => {
    // latest articles
    return getFilteredCollection(collection, 'peer-reviewed').slice(0, latestNb);
  },
  promotedPeerreviewed: (collection) => {
    // promoted articles within not the latest ones
    return getFilteredCollection(collection, 'peer-reviewed')
      .slice(latestNb)
      .filter((article) => article.data.promoted)
      .slice(0, promotedNb);
  },
};
