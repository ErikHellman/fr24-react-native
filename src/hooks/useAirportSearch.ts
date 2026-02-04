import { useCallback, useMemo, useState } from 'react';
import { AirportEntry } from '../types/airport';
import { searchAirports, normalizeSearch } from '../utils';

export type UseAirportSearchReturn = {
  searchText: string;
  selectedAirport: AirportEntry | null;
  airportSearchCode: string | null;
  searchResults: AirportEntry[];
  showNoResults: boolean;
  handleSearchTextChange: (text: string) => void;
  handleSelectAirport: (airport: AirportEntry) => void;
  closeAirportSearch: () => void;
};

export const useAirportSearch = (): UseAirportSearchReturn => {
  const [searchText, setSearchText] = useState('');
  const [selectedAirport, setSelectedAirport] = useState<AirportEntry | null>(null);
  const [airportSearchCode, setAirportSearchCode] = useState<string | null>(null);

  const handleSearchTextChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (selectedAirport || airportSearchCode) {
        setSelectedAirport(null);
        setAirportSearchCode(null);
      }
    },
    [airportSearchCode, selectedAirport],
  );

  const handleSelectAirport = useCallback((airport: AirportEntry) => {
    setSelectedAirport(airport);
    setAirportSearchCode(airport.iata);
  }, []);

  const closeAirportSearch = useCallback(() => {
    setSelectedAirport(null);
    setAirportSearchCode(null);
    setSearchText('');
  }, []);

  const searchResults = useMemo(() => {
    if (selectedAirport) {
      return [];
    }
    return searchAirports(searchText);
  }, [searchText, selectedAirport]);

  const showNoResults =
    !selectedAirport && normalizeSearch(searchText.trim()).length > 0 && searchResults.length === 0;

  return {
    searchText,
    selectedAirport,
    airportSearchCode,
    searchResults,
    showNoResults,
    handleSearchTextChange,
    handleSelectAirport,
    closeAirportSearch,
  };
};
