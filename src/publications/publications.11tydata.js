
module.exports = {/*
  eleventyComputed: {
    bibentry: (data) => {
      var res={};
      for (const entry in data.bibM) {
          if(data.bibM[entry].id===data.page.fileSlug){
            res = data.bibM[entry];
          }
      }
        return res;
    }, },
    */
  // tags: (data) => tags(data),




  /*  tags: (data) => {
      if (data.content === undefined) {
        return data.tags || [];
      }

      let tags = data.keyword;
      if (data.tags !== undefined) {
        // merge and deduplicate
        tags = [...new Set([].concat(...tags, ...data.tags))];
      }
      return tags;
    },*/  

   
    
  };
