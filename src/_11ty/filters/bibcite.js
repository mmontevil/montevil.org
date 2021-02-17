 
 const fs = require('fs');
const linkifyUrls = require('linkify-urls');
const Cite = require('citation-js');
const path = require('path');

module.exports =  {

    urlify: (text)  => {
      return  linkifyUrls(text );
    },
    
    
      bibcite: (bibfi) => {
              let relativeFilePath = `${bibfi}`;
              let rawBib = fs.readFileSync(relativeFilePath);
                  const cite =new Cite(`${rawBib}`);
     return linkifyUrls(cite.format('bibliography', {
            format: 'html',
            template: 'apa',
            lang: 'en-US'
        }))
         },
          bibbibtex:(bibfi)  =>{
              let relativeFilePath = `${bibfi}`;
              let rawBib = fs.readFileSync(relativeFilePath);
                  const cite =new Cite(`${rawBib}`);
     return cite.format('bibtex', {
            format: 'html',
            template: 'apa',
            lang: 'en-US'
        })
         },     
        bibcite2: (bibfi) => {
                  const cite =new Cite(JSON.stringify(bibfi));
     return linkifyUrls(cite.format('bibliography', {
            format: 'html',
            template: 'apa',
            lang: 'en-US'
        }))
         },        
                 
};
