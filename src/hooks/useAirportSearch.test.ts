import { renderHook, act } from '@testing-library/react-native';
import { useAirportSearch } from './useAirportSearch';
import { AirportEntry } from '../types/airport';

const mockAirport: AirportEntry = {
  name: 'San Francisco International Airport',
  iata: 'SFO',
  icao: 'KSFO',
  city: 'San Francisco',
  country: 'United States',
  coordinates: { latitude: 37.6213, longitude: -122.379 },
};

describe('useAirportSearch', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useAirportSearch());

    expect(result.current.searchText).toBe('');
    expect(result.current.selectedAirport).toBeNull();
    expect(result.current.airportSearchCode).toBeNull();
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.showNoResults).toBe(false);
  });

  it('updates search text', () => {
    const { result } = renderHook(() => useAirportSearch());

    act(() => {
      result.current.handleSearchTextChange('SFO');
    });

    expect(result.current.searchText).toBe('SFO');
  });

  it('computes search results from text', () => {
    const { result } = renderHook(() => useAirportSearch());

    act(() => {
      result.current.handleSearchTextChange('SFO');
    });

    expect(result.current.searchResults.length).toBeGreaterThan(0);
  });

  it('sets selected airport and code on handleSelectAirport', () => {
    const { result } = renderHook(() => useAirportSearch());

    act(() => {
      result.current.handleSelectAirport(mockAirport);
    });

    expect(result.current.selectedAirport).toEqual(mockAirport);
    expect(result.current.airportSearchCode).toBe('SFO');
  });

  it('clears search results when airport is selected', () => {
    const { result } = renderHook(() => useAirportSearch());

    act(() => {
      result.current.handleSearchTextChange('SFO');
    });

    expect(result.current.searchResults.length).toBeGreaterThan(0);

    act(() => {
      result.current.handleSelectAirport(mockAirport);
    });

    expect(result.current.searchResults).toEqual([]);
  });

  it('clears selected airport when typing new text', () => {
    const { result } = renderHook(() => useAirportSearch());

    act(() => {
      result.current.handleSelectAirport(mockAirport);
    });

    expect(result.current.selectedAirport).toEqual(mockAirport);

    act(() => {
      result.current.handleSearchTextChange('LAX');
    });

    expect(result.current.selectedAirport).toBeNull();
    expect(result.current.airportSearchCode).toBeNull();
  });

  it('resets all state on closeAirportSearch', () => {
    const { result } = renderHook(() => useAirportSearch());

    act(() => {
      result.current.handleSearchTextChange('SFO');
      result.current.handleSelectAirport(mockAirport);
    });

    act(() => {
      result.current.closeAirportSearch();
    });

    expect(result.current.searchText).toBe('');
    expect(result.current.selectedAirport).toBeNull();
    expect(result.current.airportSearchCode).toBeNull();
  });

  it('shows no results for non-matching query', () => {
    const { result } = renderHook(() => useAirportSearch());

    act(() => {
      result.current.handleSearchTextChange('xyznonexistent123');
    });

    expect(result.current.showNoResults).toBe(true);
    expect(result.current.searchResults).toEqual([]);
  });

  it('does not show no results for empty query', () => {
    const { result } = renderHook(() => useAirportSearch());

    act(() => {
      result.current.handleSearchTextChange('');
    });

    expect(result.current.showNoResults).toBe(false);
  });

  it('does not show no results when airport is selected', () => {
    const { result } = renderHook(() => useAirportSearch());

    act(() => {
      result.current.handleSearchTextChange('xyznonexistent123');
    });

    expect(result.current.showNoResults).toBe(true);

    act(() => {
      result.current.handleSelectAirport(mockAirport);
    });

    expect(result.current.showNoResults).toBe(false);
  });
});
