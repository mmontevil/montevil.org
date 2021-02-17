let filteredCollectionsMemoization = {};
let now = new Date().getTime();
const getCollectionbyCat = (collection, type,lang) => {
  if (type+lang in filteredCollectionsMemoization) {
    return filteredCollectionsMemoization[type+lang];
  } else {
    let filteredCollection = collection.getAll().filter(function(item) {
      if(type==='archives'){return "category" in item.data && item.data.category[0] && (lang==='all' || item.data.lang===lang);}
      if(item.data.category){
         return  item.data.category.includes( type)&& (lang==='all' || item.data.lang===lang);     
      }
      return false;
    }).filter((item) => now >= item.date.getTime())
      .sort((a, b) => parseInt(b.data.orderDate.replace(new RegExp("\\" + '-', "gi"), "")) - parseInt(a.data.orderDate.replace(new RegExp("\\" + '-', "gi"), "")));
    filteredCollectionsMemoization[type] = filteredCollection;
    return filteredCollection;
  }
};

module.exports = getCollectionbyCat;
