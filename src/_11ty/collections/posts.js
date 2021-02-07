const getFilteredCollection = require('../../_utils/filter-collection');

const latestNb = 3;
const promotedNb = 3;

module.exports = {
  posts: (collection) => {
    return getFilteredCollection(collection, 'posts');
  },
  latestPosts: (collection) => {
    // latest posts
    return getFilteredCollection(collection, 'posts').slice(0, latestNb);
  },
  promotedPosts: (collection) => {
    // promoted posts within not the latest ones
    return getFilteredCollection(collection, 'posts')
      .slice(latestNb)
      .filter((article) => article.data.promoted)
      .slice(0, promotedNb);
  },
};
