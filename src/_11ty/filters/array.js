module.exports = {
  size: (array) => {
    return !array ? 0 : array.length;
  },
  split: (string, separator) => {
    return string.split(separator);
  },
  limit: (array, limit) => {
    return array.slice(0, limit);
  },
  offset: (array, offset) => {
    return array.slice(offset);
  },
  uniq: (array) => {
    return [...new Set(array)];
  },
  splarray: (string) => {
    res = 'a';
    if (string === undefined) {
    } else {
      let arr = string.split(', ');
      let res = '';
      for (const key in arr) {
        res = res + "   - '" + arr[key] + "'\n";
      }
      res = res + '';
    }
    return res;
  },
  splarray2: (string) => {
    let arr = string.split(', ');
    return arr;
  },
};
