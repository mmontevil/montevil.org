let filteredCollectionsMemoization = {};
let now = new Date().getTime();
const getCollectionbyCat = (collection, type) => {
  if (type in filteredCollectionsMemoization) {
    return filteredCollectionsMemoization[type];
  } else {
    let filteredCollection = collection.getAll().filter(function(item) {
      if(type==='archives'){return "category" in item.data;}
      if(item.data.category){
         return  item.data.category.includes( type);     
      }
      return false;
    }).filter((item) => now >= item.date.getTime())
      .sort((a, b) => parseInt(b.data.orderDate.replace(new RegExp("\\" + '-', "gi"), "")) - parseInt(a.data.orderDate.replace(new RegExp("\\" + '-', "gi"), "")));
    filteredCollectionsMemoization[type] = filteredCollection;
    return filteredCollection;
  }
};

module.exports = getCollectionbyCat;
