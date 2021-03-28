function range(j, k) {
  return Array.apply(null, Array(k - j + 1)).map(function (_, n) {
    return n + j;
  });
}

module.exports = {
  numbers2: range(-999, 999),
};
