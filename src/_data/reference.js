const { readFileSync } = require('fs');
const databibM = readFileSync('./src/_data/bibM.json');
bibM = JSON.parse(databibM);

const Cite = require('citation-js');
const config = Cite.plugins.config.get('@csl');
let templateName = 'chicago';

function refs(bibM,Cite,templateName) {
  var res = {};
  for (const entry in bibM){
      bibfi=bibM[entry];
      const cite = new Cite(JSON.stringify(bibfi));
      var txt = cite.format('bibliography', {
        format: 'text',
        template: templateName,
        lang: 'en-US',
      });
      res[bibfi.id]={};
      res[bibfi.id].bib=bibfi;
      res[bibfi.id].txt=txt;
      
  }
  return(res);
}
module.exports = {
  references: refs(bibM,Cite,templateName), 
};
