import { normalizeSearch } from './normalize';

describe('normalizeSearch', () => {
  it('converts to lowercase', () => {
    expect(normalizeSearch('SFO')).toBe('sfo');
    expect(normalizeSearch('San Francisco')).toBe('san francisco');
  });

  it('removes diacritical marks (accents)', () => {
    expect(normalizeSearch('café')).toBe('cafe');
    expect(normalizeSearch('Zürich')).toBe('zurich');
    expect(normalizeSearch('São Paulo')).toBe('sao paulo');
    expect(normalizeSearch('Düsseldorf')).toBe('dusseldorf');
    expect(normalizeSearch('Málaga')).toBe('malaga');
  });

  it('handles spanish ñ', () => {
    expect(normalizeSearch('España')).toBe('espana');
    expect(normalizeSearch('Señor')).toBe('senor');
  });

  it('handles empty strings', () => {
    expect(normalizeSearch('')).toBe('');
  });

  it('handles strings without special characters', () => {
    expect(normalizeSearch('new york')).toBe('new york');
    expect(normalizeSearch('LONDON')).toBe('london');
  });

  it('handles unicode edge cases', () => {
    expect(normalizeSearch('Ångström')).toBe('angstrom');
    expect(normalizeSearch('naïve')).toBe('naive');
    expect(normalizeSearch('résumé')).toBe('resume');
  });

  it('preserves numbers and basic punctuation', () => {
    expect(normalizeSearch('Terminal 1')).toBe('terminal 1');
    expect(normalizeSearch('A-380')).toBe('a-380');
  });
});
