let filteredCollectionsMemoization = {};
let now = new Date().getTime();
const getFilteredCollection = (collection, type) => {
  if (type in filteredCollectionsMemoization) {
    return filteredCollectionsMemoization[type];
  } else {
    const pattern = type === 'archives' ? '{publications,articles,links,notes,talks}' : (type === 'peer-reviewed' ? 'publications/peer-reviewed' : (type === 'chapters' ? 'publications/chapters' : (type === 'varia' ? 'publications/varia' : type)));
    let filteredCollection = collection
      .getFilteredByGlob([`src/${pattern}/**/*.md`,`src/${pattern}/**/*.njk`])
      .filter((item) => now >= item.date.getTime())
      .sort((a, b) => b.date - a.date);
    filteredCollectionsMemoization[type] = filteredCollection;

    return filteredCollection;
  }
};

module.exports = getFilteredCollection;
