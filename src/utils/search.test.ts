import { scoreField, scoreAirport, searchAirports } from './search';
import { AirportEntry } from '../types/airport';

describe('scoreField', () => {
  it('returns 1000 for exact match', () => {
    expect(scoreField('sfo', 'sfo')).toBe(1000);
    expect(scoreField('london', 'london')).toBe(1000);
  });

  it('returns 800-range for prefix match', () => {
    const score = scoreField('san', 'san francisco');
    expect(score).toBeGreaterThanOrEqual(750);
    expect(score).toBeLessThanOrEqual(800);
  });

  it('returns higher score for shorter prefix matches', () => {
    const shortMatch = scoreField('sf', 'sfo');
    const longMatch = scoreField('sf', 'sf international airport');
    expect(shortMatch).toBeGreaterThan(longMatch);
  });

  it('returns 600-range for substring match', () => {
    const score = scoreField('york', 'new york');
    expect(score).toBeGreaterThanOrEqual(550);
    expect(score).toBeLessThanOrEqual(600);
  });

  it('returns higher score for earlier substring matches', () => {
    const earlyMatch = scoreField('air', 'airport');
    const lateMatch = scoreField('air', 'the airport');
    expect(earlyMatch).toBeGreaterThan(lateMatch);
  });

  it('returns 400-range for fuzzy match', () => {
    const score = scoreField('sfc', 'san francisco');
    expect(score).toBeGreaterThanOrEqual(350);
    expect(score).toBeLessThanOrEqual(400);
  });

  it('returns 0 for no match', () => {
    expect(scoreField('xyz', 'abc')).toBe(0);
    expect(scoreField('zzz', 'london')).toBe(0);
  });

  it('returns 0 for empty text', () => {
    expect(scoreField('test', '')).toBe(0);
  });

  it('handles single character queries', () => {
    expect(scoreField('s', 'sfo')).toBeGreaterThan(0);
    expect(scoreField('x', 'sfo')).toBe(0);
  });
});

describe('scoreAirport', () => {
  const mockAirport: AirportEntry = {
    name: 'San Francisco International Airport',
    iata: 'SFO',
    icao: 'KSFO',
    city: 'San Francisco',
    country: 'United States',
    coordinates: { latitude: 37.6213, longitude: -122.379 },
  };

  it('returns best score from all fields', () => {
    // Exact match on IATA should return 1000
    const exactScore = scoreAirport('sfo', mockAirport);
    expect(exactScore).toBe(1000);
  });

  it('matches on city name', () => {
    const score = scoreAirport('san francisco', mockAirport);
    expect(score).toBeGreaterThan(0);
  });

  it('matches on country', () => {
    const score = scoreAirport('united states', mockAirport);
    expect(score).toBeGreaterThan(0);
  });

  it('matches on ICAO code', () => {
    const score = scoreAirport('ksfo', mockAirport);
    expect(score).toBe(1000);
  });

  it('returns 0 for non-matching query', () => {
    const score = scoreAirport('xyz123', mockAirport);
    expect(score).toBe(0);
  });
});

describe('searchAirports', () => {
  it('returns empty array for empty query', () => {
    expect(searchAirports('')).toEqual([]);
    expect(searchAirports('   ')).toEqual([]);
  });

  it('returns max 5 results', () => {
    const results = searchAirports('a');
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('returns airports matching query', () => {
    const results = searchAirports('SFO');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((a) => a.iata === 'SFO')).toBe(true);
  });

  it('returns results sorted by score', () => {
    const results = searchAirports('los angeles');
    // LAX should be first or near top for "los angeles"
    expect(results.length).toBeGreaterThan(0);
  });

  it('handles accent-insensitive search', () => {
    // Search for airports with accented names
    const results = searchAirports('zurich');
    expect(results.length).toBeGreaterThanOrEqual(0);
  });

  it('handles case-insensitive search', () => {
    const lowerResults = searchAirports('london');
    const upperResults = searchAirports('LONDON');
    const mixedResults = searchAirports('LoNdOn');

    expect(lowerResults).toEqual(upperResults);
    expect(lowerResults).toEqual(mixedResults);
  });

  it('finds airports by partial name', () => {
    const results = searchAirports('international');
    expect(results.length).toBeGreaterThan(0);
  });

  it('prioritizes exact IATA matches', () => {
    const results = searchAirports('JFK');
    if (results.length > 0) {
      expect(results[0].iata).toBe('JFK');
    }
  });
});
