/**
 * Normalizes a string for search comparison by:
 * - Converting to NFKD unicode form
 * - Removing diacritical marks (accents)
 * - Converting to lowercase
 */
export const normalizeSearch = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
