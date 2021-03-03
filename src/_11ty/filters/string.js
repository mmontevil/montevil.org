const slugifyString = require('../../_utils/slugify');




module.exports = {
  unprotect: (string) => { 
    return string.replaceAll("\\<br\\>", "<br>"); 
  },
  base64: (string) => {
    return Buffer.from(string).toString('base64');
  },
  slugify: (string) => slugifyString(string),
  jsonify: (object) => JSON.stringify(object),
  tagToHashtag: (tag) => {
    let words = tag.replace(/[-\.]/, ' ').split(' ');
    return (
      words[0] +
      words
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + word.substr(1))
        .join('')
    );
  },
  orphans: (string) => string.replace(/((.*)\s(.{1,5}))$/g, '$2 $3'),
  titleize: (string) => {
    if (string === undefined) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
    removefirst: (string) => {
    if (string === undefined) return '';
    return string.slice(1);
  },
   urlize: (str, find,url,type="default")  =>{
var open='\“';
var close='\”';
if(type==="book"){
  open='<i>';
  close='</i>';
}
//    var find2 =find.replace(/[-[\]{}()*+?.,\\^$|]/g, "\s*.*");
 // var reg0 = new RegExp('('+find2+')', 'gi');
    var reg = new RegExp('('+open+'.*'+close+')', 'gi');

  var str2=str.replace(reg, '<a href=\"XXXX\">$1</a>');
  return str2.replace('XXXX', url);
  
},

lowerize: (string) => {return string.toLowerCase()},
};
