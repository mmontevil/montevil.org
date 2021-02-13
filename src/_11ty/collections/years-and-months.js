// https://github.com/11ty/eleventy/issues/316#issuecomment-441053919
// https://github.com/11ty/eleventy/issues/502#issuecomment-498234424

const moment = require('moment');
const getFilteredCollection = require('../../_utils/get-collection');



function makeDateFormatter(datePattern) {
  return function (date) {
  //  if (date ==" Submitted"){
  //      return (datePattern =='YYYY' ? " Submitted" : "Submitted2");
  //  }else{
        return moment(date).format(datePattern);      
    //}
  };
}

function generateItemsDateSet(items, dateFormatter) {
  const formattedDates = items.map((item) => {
    return dateFormatter(item.data.orderDate);
  });
  return [...new Set(formattedDates)];
}

function getItemsByDate(items, date, dateFormatter) {
  return items.filter((item) => {
    return dateFormatter(item.data.orderDate) === date;
  });
}

const contentByDateString = (items, dateFormatter) => {
  return generateItemsDateSet(items, dateFormatter).reduce(function (
    collected,
    formattedDate
  ) {
    return Object.assign({}, collected, {
      // lowercase to match month directory page.url
      [formattedDate.toLowerCase()]: getItemsByDate(
        items,
        formattedDate,
        dateFormatter
      ),
    });
  },
  {});
};

const yearsWithContent = (collection) => {
  return generateItemsDateSet(collection, makeDateFormatter('YYYY'));
};
const contentsByYear = (collection) => {
  return contentByDateString(collection, makeDateFormatter('YYYY'));
};

/*
const monthsWithContent = (collection) => {
  return generateItemsDateSet(collection, makeDateFormatter('YYYY/MM'));
};

const contentsByMonth = (collection) => {
  return contentByDateString(collection, makeDateFormatter('YYYY/MM'));
};
*/


let collections = {
  
};

const latestNb = 3;
const promotedNb = 3;

  
['all','fr', 'en'].forEach(
  (lang) => {
['publications','posts', 'links', 'notes', 'talks', 'archives','chapters','articles','varia','books'].forEach(
  (collectionName) => {
    // collections for yearly archives
    collections[`${collectionName}${lang}ByYear`] = (collection) => {
      return contentsByYear(getFilteredCollection(collection, collectionName,lang));
    };

      collections[`yearsWith${collectionName}${lang}`] =     (collection) => {
    return yearsWithContent(getFilteredCollection(collection, collectionName,lang));
  };   
   collections[`${collectionName}${lang}`]  =(collection) => {
    return getFilteredCollection(collection, collectionName,lang);
  };
   collections[`latest${collectionName}${lang}`] = (collection) => {
    // latest articles
    return getFilteredCollection(collection, collectionName,lang).slice(0, latestNb);
  };
  collections[`promoted${collectionName}${lang}`] = (collection) => {
    // promoted articles within not the latest ones
    return getFilteredCollection(collection, collectionName,lang)
      .slice(latestNb)
      .filter((article) => article.data.promoted)
      .slice(0, promotedNb);
  };
 /* eleventyConfig.addCollection("onlyMarkdown", function(collectionApi) {
    return collectionApi.getAllSorted().filter(function(item) {
      // Only return content that was originally a markdown file
      let extension = item.inputPath.split('.').pop();
      return extension === "md";
    });
  });*/
  
  // collections for monthly archives
 /*   collections[`${collectionName}ByMonth`] = (collection) => {
      return contentsByMonth(getFilteredCollection(collection, collectionName));
    };*/
  /* collections[`monthsWith${collectionName}`] =   (collection) => {
    return monthsWithContent(getFilteredCollection(collection, collectionName));
  } ;*/   
  
 
  }
);
  }
);  

const formatter=makeDateFormatter('YYYY');
collections[`allKeys`] = (collection) => {
    let catSet = new Set()
  collection.getAllSorted().forEach(item =>

 item.data.category && item.data.category.forEach(catt =>
        catSet.add('all/archives')&&
        catSet.add('all/archives/'+formatter(item.data.orderDate))&&
        catSet.add('all/'+catt)&&
        catSet.add('all/'+catt+'/'+formatter(item.data.orderDate))&&
        catSet.add(item.data.lang+'/archives')&&
        catSet.add(item.data.lang+'/archives/'+formatter(item.data.orderDate))&&
        catSet.add(item.data.lang+'/'+catt)&&
        catSet.add(item.data.lang+'/'+catt+'/'+formatter(item.data.orderDate))
                            
))

      
    return [...catSet];
  };



module.exports = collections;
