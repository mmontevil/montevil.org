function range(j, k) {
  return Array.from({ length: k - j + 1 }, (_, n) => n + j);
}

export const numbers2 = range(-999, 999);
