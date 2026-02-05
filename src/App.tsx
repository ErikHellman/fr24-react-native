import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlightPositionFull } from './types/flight';
import { AirportEntry } from './types/airport';
import { getAllAirports } from './utils/search';
import { INITIAL_REGION } from './constants/map';
import { colors } from './constants/theme';
import { MapRefHandle, MapRegion } from './types/map';

import { useFlightData } from './hooks/useFlightData';
import { useAirportSearch } from './hooks/useAirportSearch';
import { useBottomSheet } from './hooks/useBottomSheet';
import { useMapRegion } from './hooks/useMapRegion';

import { FlightMap } from './components/Map';
import { SearchBar, SearchResults, SelectedAirport, NoResults } from './components/Search';
import { FlightDetailsSheet } from './components/BottomSheet';

const AIRPORTS = getAllAirports();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const mapRef = useRef<MapRefHandle | null>(null);
  const lastRegionRef = useRef<MapRegion | null>(null);
  const insets = useSafeAreaInsets();

  // Custom hooks for state management
  const { mapBounds, handleRegionChangeComplete } = useMapRegion();

  const {
    searchText,
    selectedAirport,
    airportSearchCode,
    searchResults,
    showNoResults,
    handleSearchTextChange,
    handleSelectAirport: selectAirport,
    closeAirportSearch,
  } = useAirportSearch();

  const { visibleFlights } = useFlightData({
    mapBounds,
    airportSearchCode,
  });

  const {
    selectedFlight,
    sheetState,
    sheetIndex,
    snapPoints,
    setSelectedFlight,
    openSheet,
    cycleSheetState,
    handleSheetChange,
    handleSheetClose,
  } = useBottomSheet();

  // Handler for region changes that also stores last region
  const onRegionChangeComplete = useCallback(
    (region: MapRegion) => {
      lastRegionRef.current = region;
      handleRegionChangeComplete(region);
    },
    [handleRegionChangeComplete]
  );

  // Handler for selecting an airport from search
  const handleSelectAirport = useCallback(
    (airport: AirportEntry) => {
      selectAirport(airport);

      const region = lastRegionRef.current ?? INITIAL_REGION;
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: airport.coordinates.latitude,
            longitude: airport.coordinates.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
          },
          450
        );
      }
    },
    [selectAirport]
  );

  // Handler for pressing a flight marker
  const handleFlightPress = useCallback(
    (flight: FlightPositionFull) => {
      setSelectedFlight(flight);
      openSheet();

      const region = lastRegionRef.current;
      if (region && mapRef.current) {
        const targetRegion: MapRegion = {
          latitude: flight.lat - region.latitudeDelta / 4,
          longitude: flight.lon,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        };
        mapRef.current.animateToRegion(targetRegion, 300);
      }
    },
    [openSheet, setSelectedFlight]
  );

  return (
    <View style={styles.container}>
      <FlightMap
        ref={mapRef}
        airports={AIRPORTS}
        flights={visibleFlights}
        onRegionChangeComplete={onRegionChangeComplete}
        onFlightPress={handleFlightPress}
        onAirportPress={handleSelectAirport}
      />

      <View style={[styles.searchBarWrap, { top: insets.top }]}>
        <SearchBar value={searchText} onChangeText={handleSearchTextChange} />

        {selectedAirport && (
          <SelectedAirport airport={selectedAirport} onClose={closeAirportSearch} />
        )}

        {!selectedAirport && searchResults.length > 0 && (
          <SearchResults airports={searchResults} onSelect={handleSelectAirport} />
        )}

        {showNoResults && <NoResults onClose={closeAirportSearch} />}
      </View>

      {selectedFlight && (
        <FlightDetailsSheet
          flight={selectedFlight}
          sheetState={sheetState}
          sheetIndex={sheetIndex}
          snapPoints={snapPoints}
          onSheetChange={handleSheetChange}
          onSheetClose={handleSheetClose}
          onCycleState={cycleSheetState}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  searchBarWrap: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
});
