//const { Purgecss } = require('purgecss')
const CleanCSS = require("clean-css");
//import PurgeCSS from 'purgecss'
import PurgeCSS from 'purgecss'

const purge =async function (content,cssFiles) {
   // const Purgecss=await import('purgecss');
   //return "ss";
  const cleanCSSOptions = {
  level: {
    1: {
      all: true,
      normalizeUrls: false
    },
    2: {
      restructureRules: true
    }
  }
}
      const purgecssResult = await new PurgeCSS().purge({
        content: [{
      raw: '<html><body>'+content+'</body></html>',
      extension: 'html'
          }],
        css: [{raw: cssFiles}],
        safelist: [/data-theme$/, /.*lightbox.*/]
      });
     
     // console.log(cssFiles)
      let cssMerge = ''
      
      if(purgecssResult.length>0){
        for (let i = 0; i < purgecssResult.length; i++){
          cssMerge= cssMerge.concat(purgecssResult[i].css)
        }
        //const cssMin = await new CleanCSS(cleanCSSOptions).minify(cssMerge).styles;
      
        return cssMerge;
      }
        cssMerge= cssMerge.concat(purgecssResult.css)
       // const cssMin = await new CleanCSS(cleanCSSOptions).minify(cssMerge).styles;
      
        return cssMerge;
  

  }

module.exports = purge
