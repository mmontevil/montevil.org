 module.exports = {
  
   hasTag(collection,tag) {
   return collection.filter(function(item) {
     return  item.data.tags.includes( tag);}
     );
    },
};
