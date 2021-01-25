let filteredCollectionsMemoization = {};
const getFilteredCollection = (collection, type) => {
  if (type in filteredCollectionsMemoization) {
    return filteredCollectionsMemoization[type];
  } else {
    const pattern = type === 'archives' ? '{publications,articles,links,notes,talks}' : (type === 'peer-reviewed' ? 'publications/peer-reviewed' : (type === 'chapters' ? 'publications/chapters' : (type === 'varia' ? 'publications/varia' : type)));
    let filteredCollection = collection
      .getFilteredByGlob([`src/${pattern}/**/*.md`,`src/${pattern}/**/*.njk`])
      .sort((a, b) => b.date - a.date);
    filteredCollectionsMemoization[type] = filteredCollection;

    return filteredCollection;
  }
};

module.exports = getFilteredCollection;
