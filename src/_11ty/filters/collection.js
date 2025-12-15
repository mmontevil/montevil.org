// collectionsFilters.mjs
export function sortByOrder(values) {
  if (!values || typeof values[Symbol.iterator] !== 'function') return [];
  return [...values].sort((a, b) => (a.data?.datepub ?? '').localeCompare(b.data?.datepub ?? ''));
}

export function sortByOrder2(values) {
  if (!values || typeof values[Symbol.iterator] !== 'function') return [];
  return [...values].sort((a, b) => (a.data?.orderDate ?? '').localeCompare(b.data?.orderDate ?? ''));
}

export function topubs(values) {
  if (!values || typeof values[Symbol.iterator] !== 'function') return [];
  return [...values].sort((a, b) => (b.data?.mentionsScore ?? 0) - (a.data?.mentionsScore ?? 0));
}

export function randomPost(values, count = 1) {
  if (!values || typeof values[Symbol.iterator] !== 'function') return [];
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
