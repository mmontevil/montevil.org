export const size = (array) => {
  return Array.isArray(array) ? array.length : 0;
};

export const split = (string, separator) => {
  if (typeof string !== "string") return [];
  return string.split(separator);
};

export const limit = (array, limit) => {
  if (!Array.isArray(array)) return [];
  return array.slice(0, limit);
};

export const offset = (array, offset) => {
  if (!Array.isArray(array)) return [];
  return array.slice(offset);
};

export const isnotin = (el, array) => {
  if (!Array.isArray(array)) return true;
  return !array.includes(el);
};
