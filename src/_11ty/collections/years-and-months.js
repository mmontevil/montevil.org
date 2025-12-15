// collections.js (ESM)
import moment from 'moment';

const filteredCollectionsMemoization = {};
const now = Date.now();

function getFilteredCollection(collection, type, lang) {
  const key = type + lang;
  if (filteredCollectionsMemoization[key]) return filteredCollectionsMemoization[key];

  const filteredCollection = collection
    .getAll()
    .filter((item) => {
      const categories = item.data?.category ?? [];
      if (type === 'archives') {
        return categories[0] && (lang === 'all' || item.data.lang === lang);
      }
      return categories.includes(type) && (lang === 'all' || item.data.lang === lang);
    })
    .filter((item) => item.date?.getTime() <= now)
    .sort((a, b) => {
      const orderA = a.data?.orderDate?.replace(/-/g, '') ?? '0';
      const orderB = b.data?.orderDate?.replace(/-/g, '') ?? '0';
      return parseInt(orderB, 10) - parseInt(orderA, 10);
    });

  filteredCollectionsMemoization[key] = filteredCollection;
  return filteredCollection;
}

function makeDateFormatter(pattern) {
  return function (date) {
    if (!date || date === '2100-01-01') return 'Submitted';
    return moment(date).format(pattern);
  };
}

function generateItemsDateSet(items, dateFormatter) {
  return [...new Set(items.map((item) => dateFormatter(item.data?.orderDate ?? '')))]; 
}

function getItemsByDate(items, date, dateFormatter) {
  return items.filter((item) => dateFormatter(item.data?.orderDate ?? '') === date);
}

function contentByDateString(items, dateFormatter) {
  return generateItemsDateSet(items, dateFormatter).reduce((acc, date) => {
    acc[date] = getItemsByDate(items, date, dateFormatter);
    return acc;
  }, {});
}

function yearsWithContent(collection) {
  return generateItemsDateSet(collection, makeDateFormatter('YYYY'));
}

function contentsByYear(collection) {
  return contentByDateString(collection, makeDateFormatter('YYYY'));
}

const latestNb = 3;
const promotedNb = 3;

const collections = {};
const langs = ['all', 'fr', 'en'];
const collectionNames = [
  'publications', 'posts', 'links', 'notes', 'talks', 'archives', 'chapters',
  'articles', 'varia', 'books', 'SamaDocs', 'video', 'events', 'media'
];

for (const lang of langs) {
  for (const name of collectionNames) {
    collections[`${name}${lang}ByYear`] = (collection) =>
      contentsByYear(getFilteredCollection(collection, name, lang));

    collections[`yearsWith${name}${lang}`] = (collection) =>
      yearsWithContent(getFilteredCollection(collection, name, lang));

    collections[`${name}${lang}`] = (collection) =>
      getFilteredCollection(collection, name, lang);

    collections[`latest${name}${lang}`] = (collection) =>
      getFilteredCollection(collection, name, lang).slice(0, latestNb);

    collections[`promoted${name}${lang}`] = (collection) =>
      getFilteredCollection(collection, name, lang)
        .slice(latestNb)
        .filter((item) => item.data?.promoted)
        .slice(0, promotedNb);
  }
}

const formatter = makeDateFormatter('YYYY');
collections.allKeys = (collection) => {
  const catSet = new Set();
  collection.getAllSorted().forEach((item) => {
    const categories = item.data?.category ?? [];
    categories.forEach((catt) => {
      const orderDate = formatter(item.data?.orderDate ?? '');
      const lang = item.data?.lang ?? 'all';
      catSet.add('all/archives');
      catSet.add(`all/archives/${orderDate}`);
      catSet.add(`all/${catt}`);
      catSet.add(`all/${catt}/${orderDate}`);
      catSet.add(`${lang}/archives`);
      catSet.add(`${lang}/archives/${orderDate}`);
      catSet.add(`${lang}/${catt}`);
      catSet.add(`${lang}/${catt}/${orderDate}`);
    });
  });
  return [...catSet];
};

const formatter2 = makeDateFormatter('YYYYMMDD');
collections.futureTalks = (collection) =>
  collection.getAll().filter((item) => {
    const catIncludesTalks = item.data?.category?.includes('talks') ?? false;
    const annonceExists = item.data?.bibentryconf?.fields?.annonce ?? false;
    const diff = parseInt(formatter2(Date.now()), 10) - parseInt(formatter2(item.data?.orderDate ?? ''), 10);
    return catIncludesTalks && annonceExists && diff <= 0;
  });

export default collections;
