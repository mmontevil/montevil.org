let filteredCollectionsMemoization = {};
let now = new Date().getTime();
var specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.";
const getFilteredCollection = (collection, type) => {
  if (type in filteredCollectionsMemoization) {
    return filteredCollectionsMemoization[type];
  } else {
    const pattern = type === 'archives' ? '{publications,posts,links,notes,talks}' : (type === 'articles' ? 'publications/articles' : (type === 'chapters' ? 'publications/chapters' : (type === 'varia' ? 'publications/varia' : type)));
    let filteredCollection = collection
      .getFilteredByGlob([`src/${pattern}/**/*.md`,`src/${pattern}/**/*.njk`])
      .filter((item) => now >= item.date.getTime())
      .sort((a, b) => parseInt(b.data.orderDate.replace(new RegExp("\\" + '-', "gi"), "")) - parseInt(a.data.orderDate.replace(new RegExp("\\" + '-', "gi"), "")));
    filteredCollectionsMemoization[type] = filteredCollection;

    return filteredCollection;
  }
};

module.exports = getFilteredCollection;
