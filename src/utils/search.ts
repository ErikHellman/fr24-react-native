import { AirportEntry } from '../types/airport';
import { normalizeSearch } from './normalize';

// Load airports data
const AIRPORTS = require('../../assets/airports.json') as AirportEntry[];

/**
 * Scores how well a query matches a text field.
 * Higher scores indicate better matches.
 *
 * Scoring tiers:
 * - 1000: Exact match
 * - 800-750: Prefix match (starts with query)
 * - 600-550: Substring match (contains query)
 * - 400-350: Fuzzy match (all characters appear in order)
 * - 0: No match
 */
export const scoreField = (query: string, text: string): number => {
  if (!text) {
    return 0;
  }
  if (text === query) {
    return 1000;
  }
  if (text.startsWith(query)) {
    return 800 - Math.min(text.length - query.length, 50);
  }
  const index = text.indexOf(query);
  if (index !== -1) {
    return 600 - Math.min(index, 50);
  }

  // Fuzzy matching: check if all query characters appear in order
  let queryIndex = 0;
  for (let i = 0; i < text.length && queryIndex < query.length; i += 1) {
    if (text[i] === query[queryIndex]) {
      queryIndex += 1;
    }
  }
  if (queryIndex === query.length) {
    return 400 - Math.min(text.length - query.length, 50);
  }

  return 0;
};

/**
 * Scores an airport against a search query by checking
 * name, city, country, IATA, and ICAO fields.
 * Returns the best score among all fields.
 */
export const scoreAirport = (query: string, airport: AirportEntry): number => {
  const fields = [
    airport.name,
    airport.city,
    airport.country,
    airport.iata,
    airport.icao,
  ].filter(Boolean);

  let best = 0;
  for (const field of fields) {
    const score = scoreField(query, normalizeSearch(field));
    if (score > best) {
      best = score;
    }
  }
  return best;
};

/**
 * Searches airports by query string.
 * Returns top 5 matching airports sorted by relevance score.
 */
export const searchAirports = (query: string): AirportEntry[] => {
  const normalizedQuery = normalizeSearch(query.trim());
  if (!normalizedQuery) {
    return [];
  }

  const results = AIRPORTS.map((airport) => ({
    airport,
    score: scoreAirport(normalizedQuery, airport),
  }))
    .filter((result) => result.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.airport.name.localeCompare(b.airport.name);
    })
    .slice(0, 5)
    .map((result) => result.airport);

  return results;
};

/**
 * Returns all loaded airports
 */
export const getAllAirports = (): AirportEntry[] => AIRPORTS;
