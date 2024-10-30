
module.exports = {
  unprotect: (string) => {
    return string.replaceAll('\\<br\\>', '<br>');
  },
  orphans: (string) => string.replace(/((.*)\s(.{1,5}))$/g, '$2 $3'),
  urlize: (str, find, url, type = 'default') => {
    var open = '“';
    var close = '”';
    if (type === 'book') {
      open = '<i>';
      close = '</i>';
    }
    //    var find2 =find.replace(/[-[\]{}()*+?.,\\^$|]/g, "\s*.*");
    // var reg0 = new RegExp('('+find2+')', 'gi');
    var reg = new RegExp('(' + open + '.*' + close + ')', 'gi');

    var str2 = str.replace(reg, '<a href="XXXX">$1</a>');
    return str2.replace('XXXX', url);
  },
  initials: (string) => {
    let res = string[0];
    let list = string.replaceAll('-', ' ').replaceAll('  ', ' ').split(' ');
    for (i in list) {
      if (i > 0) {
        res = res + list[i][0];
      }
    }

    return res;
  },
  lowerize: (string) => {
    return string.toLowerCase();
  },
};
