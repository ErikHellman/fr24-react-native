import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FlightPositionFull,
  getLiveFlightPositionsFull,
  getLiveFlightPositionsFullByAirport,
  MapBounds,
} from './api/fr24';

type AirportEntry = {
  name: string;
  iata: string;
  icao: string;
  city: string;
  country: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
};

const AIRPORTS = require('../assets/airports.json') as AirportEntry[];

const INITIAL_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

import FLIGHT_MARKER_IMAGE from '../assets/a380.png';

const FR24_API_KEY = process.env.EXPO_PUBLIC_FR24_API_KEY ?? '';

const normalizeSearch = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const scoreField = (query: string, text: string) => {
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

const scoreAirport = (query: string, airport: AirportEntry) => {
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

const searchAirports = (query: string) => {
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

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [visibleFlights, setVisibleFlights] = useState<FlightPositionFull[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightPositionFull | null>(null);
  const [sheetState, setSheetState] = useState<'collapsed' | 'half' | 'full'>('collapsed');
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedAirport, setSelectedAirport] = useState<AirportEntry | null>(null);
  const [airportSearchCode, setAirportSearchCode] = useState<string | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const lastRegionRef = useRef<Region | null>(null);
  const { height: screenHeight } = useWindowDimensions();
  const sheetHalfHeight = useMemo(() => Math.round(screenHeight * 0.5), [screenHeight]);
  const sheetFullHeight = useMemo(() => Math.round(screenHeight * 0.92), [screenHeight]);
  const sheetCollapsedHeight = 96;
  const sheetTranslateY = useRef(new Animated.Value(screenHeight)).current;
  const insets = useSafeAreaInsets();

  const fetchLiveFlights = useCallback((bounds: MapBounds) => {
    if (inFlightRef.current) {
      inFlightRef.current.abort();
    }

    const controller = new AbortController();
    inFlightRef.current = controller;

    getLiveFlightPositionsFull(FR24_API_KEY, { bounds, signal: controller.signal })
      .then((response) => {
        setVisibleFlights(response.data);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.warn('Failed to fetch live flight positions:', error);
      });
  }, []);

  const fetchLiveFlightsByAirport = useCallback((airportCode: string) => {
    if (inFlightRef.current) {
      inFlightRef.current.abort();
    }

    const controller = new AbortController();
    inFlightRef.current = controller;

    getLiveFlightPositionsFullByAirport(FR24_API_KEY, { airportCode, signal: controller.signal })
      .then((response) => {
        setVisibleFlights(response.data);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
      });
  }, []);

  const closeAirportSearch = useCallback(() => {
    setSelectedAirport(null);
    setAirportSearchCode(null);
    setSearchText('');
  }, []);

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

  const handleSelectAirport = useCallback(
    (airport: AirportEntry) => {
      setSelectedAirport(airport);
      setAirportSearchCode(airport.iata);

      const region = lastRegionRef.current ?? INITIAL_REGION;
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: airport.coordinates.latitude,
            longitude: airport.coordinates.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
          },
          450,
        );
      }
    },
    [],
  );

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      lastRegionRef.current = region;
      const north = region.latitude + region.latitudeDelta / 2;
      const south = region.latitude - region.latitudeDelta / 2;
      const east = region.longitude + region.longitudeDelta / 2;
      const west = region.longitude - region.longitudeDelta / 2;

      const bounds: MapBounds = { north, south, east, west };
      setMapBounds(bounds);
    },
    [],
  );

  useEffect(() => {
    if (!airportSearchCode) {
      return;
    }

    fetchLiveFlightsByAirport(airportSearchCode);
    const intervalId = setInterval(() => {
      fetchLiveFlightsByAirport(airportSearchCode);
    }, 10000);

    return () => {
      clearInterval(intervalId);
      if (inFlightRef.current) {
        inFlightRef.current.abort();
      }
    };
  }, [airportSearchCode, fetchLiveFlightsByAirport]);

  useEffect(() => {
    if (airportSearchCode || !mapBounds) {
      return;
    }

    fetchLiveFlights(mapBounds);
    const intervalId = setInterval(() => {
      fetchLiveFlights(mapBounds);
    }, 10000);

    return () => {
      clearInterval(intervalId);
      if (inFlightRef.current) {
        inFlightRef.current.abort();
      }
    };
  }, [airportSearchCode, fetchLiveFlights, mapBounds]);

  const searchResults = useMemo(() => {
    if (selectedAirport) {
      return [];
    }
    return searchAirports(searchText);
  }, [searchText, selectedAirport]);

  const showNoResults =
    !selectedAirport && normalizeSearch(searchText.trim()).length > 0 && searchResults.length === 0;

  useEffect(() => {
    if (!selectedFlight) {
      sheetTranslateY.setValue(sheetFullHeight);
    }
  }, [selectedFlight, sheetFullHeight, sheetTranslateY]);

  const animateSheetTo = useCallback(
    (state: 'collapsed' | 'half' | 'full') => {
      const visibleHeight =
        state === 'full'
          ? sheetFullHeight
          : state === 'half'
            ? sheetHalfHeight
            : sheetCollapsedHeight;
      Animated.timing(sheetTranslateY, {
        toValue: sheetFullHeight - visibleHeight,
        duration: 220,
        useNativeDriver: true,
      }).start();
    },
    [sheetCollapsedHeight, sheetFullHeight, sheetHalfHeight, sheetTranslateY],
  );

  useEffect(() => {
    if (selectedFlight) {
      animateSheetTo(sheetState);
    }
  }, [animateSheetTo, selectedFlight, sheetState]);

  const openSheet = useCallback(() => {
    setSheetState('half');
  }, []);

  const expandSheetFull = useCallback(() => {
    setSheetState('full');
  }, []);

  const collapseSheet = useCallback(() => {
    setSheetState('collapsed');
  }, []);

  const closeSheet = useCallback(() => {
    Animated.timing(sheetTranslateY, {
      toValue: sheetFullHeight,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSelectedFlight(null);
        setSheetState('collapsed');
      }
    });
  }, [sheetFullHeight, sheetTranslateY]);

  const flightDetails = useMemo(() => {
    if (!selectedFlight) {
      return [];
    }
    return [
      ['FR24 ID', selectedFlight.fr24_id],
      ['Flight', selectedFlight.flight],
      ['Callsign', selectedFlight.callsign],
      ['Latitude', selectedFlight.lat],
      ['Longitude', selectedFlight.lon],
      ['Track', selectedFlight.track],
      ['Altitude (ft)', selectedFlight.alt],
      ['Ground Speed (kt)', selectedFlight.gspeed],
      ['Vertical Speed (fpm)', selectedFlight.vspeed],
      ['Squawk', selectedFlight.squawk],
      ['Timestamp', selectedFlight.timestamp],
      ['Source', selectedFlight.source],
      ['Hex', selectedFlight.hex],
      ['Type', selectedFlight.type],
      ['Registration', selectedFlight.reg],
      ['Painted As', selectedFlight.painted_as],
      ['Operating As', selectedFlight.operating_as],
      ['Origin IATA', selectedFlight.orig_iata],
      ['Origin ICAO', selectedFlight.orig_icao],
      ['Destination IATA', selectedFlight.dest_iata],
      ['Destination ICAO', selectedFlight.dest_icao],
      ['ETA', selectedFlight.eta],
    ] as Array<[string, string | number | null]>;
  }, [selectedFlight]);

  return (
    <View style={styles.container}>
      <MapView
        ref={(ref) => {
          mapRef.current = ref;
        }}
        style={styles.map}
        loadingEnabled
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {AIRPORTS.map((airport) => (
          <Marker
            key={airport.iata}
            coordinate={{
              latitude: airport.coordinates.latitude,
              longitude: airport.coordinates.longitude,
            }}
            title={airport.name}
            description={`${airport.city}, ${airport.country} • ${airport.iata}`}
            onPress={() => handleSelectAirport(airport)}
          />
        ))}
        {visibleFlights.map((flight) => (
          <Marker
            key={flight.fr24_id}
            coordinate={{ latitude: flight.lat, longitude: flight.lon }}
            title={flight.flight ?? flight.callsign ?? 'Fake flight'}
            description={`${flight.alt} ft • ${flight.gspeed} kt`}
            rotation={flight.track}
            image={FLIGHT_MARKER_IMAGE}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => {
              setSelectedFlight(flight);
              openSheet();
              const region = lastRegionRef.current;
              if (region && mapRef.current) {
                const targetRegion: Region = {
                  latitude: flight.lat - region.latitudeDelta / 4,
                  longitude: flight.lon,
                  latitudeDelta: region.latitudeDelta,
                  longitudeDelta: region.longitudeDelta,
                };
                mapRef.current.animateToRegion(targetRegion, 300);
              }
            }}
          />
        ))}
      </MapView>
      <View style={[styles.searchBarWrap, { top: insets.top }]}>
        <TextInput
          placeholder="Search flights, callsign, airport..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearchTextChange}
        />
        {selectedAirport ? (
          <View style={styles.searchResultWrap}>
            <View style={styles.searchResultRow}>
              <View style={styles.searchResultMeta}>
                <Text style={styles.searchResultTitle}>{selectedAirport.name}</Text>
                <Text style={styles.searchResultSubtitle}>
                  {selectedAirport.city}, {selectedAirport.country}
                </Text>
              </View>
              <View style={styles.searchResultCodes}>
                <Text style={styles.searchResultCode}>{selectedAirport.iata}</Text>
                <Text style={styles.searchResultCodeMuted}>{selectedAirport.icao}</Text>
              </View>
              <Pressable onPress={closeAirportSearch} hitSlop={8}>
                <Text style={styles.searchResultClose}>X</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        {!selectedAirport && searchResults.length > 0 ? (
          <View style={styles.searchResultsList}>
            {searchResults.map((airport, index) => (
              <Pressable
                key={airport.iata}
                style={[
                  styles.searchResultItem,
                  index === searchResults.length - 1 ? styles.searchResultItemLast : null,
                ]}
                onPress={() => handleSelectAirport(airport)}
              >
                <View style={styles.searchResultMeta}>
                  <Text style={styles.searchResultTitle}>{airport.name}</Text>
                  <Text style={styles.searchResultSubtitle}>
                    {airport.city}, {airport.country}
                  </Text>
                </View>
                <View style={styles.searchResultCodes}>
                  <Text style={styles.searchResultCode}>{airport.iata}</Text>
                  <Text style={styles.searchResultCodeMuted}>{airport.icao}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
        {showNoResults ? (
          <View style={styles.searchResultWrap}>
            <View style={styles.searchResultRow}>
              <Text style={styles.searchResultText}>No airports found.</Text>
              <Pressable onPress={closeAirportSearch} hitSlop={8}>
                <Text style={styles.searchResultClose}>X</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
      {selectedFlight ? (
        <>
          {sheetState !== 'collapsed' ? (
            <Pressable style={styles.sheetBackdrop} onPress={closeSheet} />
          ) : null}
          <Animated.View
            style={[
              styles.sheet,
              {
                height: sheetFullHeight,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <Pressable
              style={styles.sheetHandleWrap}
              onPress={() => {
                if (sheetState === 'collapsed') {
                  setSheetState('half');
                } else if (sheetState === 'half') {
                  setSheetState('full');
                } else {
                  setSheetState('collapsed');
                }
              }}
            >
              <View style={styles.sheetHandle} />
            </Pressable>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {selectedFlight.flight ?? selectedFlight.callsign ?? 'Flight Details'}
              </Text>
              <View style={styles.sheetActions}>
                {sheetState !== 'full' ? (
                  <Pressable onPress={expandSheetFull} hitSlop={10}>
                    <Text style={styles.sheetAction}>Expand</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={collapseSheet} hitSlop={10}>
                    <Text style={styles.sheetAction}>Collapse</Text>
                  </Pressable>
                )}
                <Pressable onPress={closeSheet} hitSlop={10}>
                  <Text style={styles.sheetClose}>Close</Text>
                </Pressable>
              </View>
            </View>
            {sheetState === 'collapsed' ? (
              <View style={styles.sheetContent}>
                {flightDetails
                  .filter(([label]) => label === 'FR24 ID' || label === 'Callsign')
                  .map(([label, value]) => (
                    <View key={label} style={styles.sheetRow}>
                      <Text style={styles.sheetLabel}>{label}</Text>
                      <Text style={styles.sheetValue}>
                        {value === null || value === undefined ? '—' : String(value)}
                      </Text>
                    </View>
                  ))}
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.sheetContent}>
                {flightDetails.map(([label, value]) => (
                  <View key={label} style={styles.sheetRow}>
                    <Text style={styles.sheetLabel}>{label}</Text>
                    <Text style={styles.sheetValue}>
                      {value === null || value === undefined ? '—' : String(value)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </>
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    flex: 1,
  },
  flightMarker: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  searchBarWrap: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  searchInput: {
    height: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: '#fff',
    backgroundColor: 'rgba(18, 23, 31, 0.68)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchResultWrap: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 18, 23, 0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  searchResultsList: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(14, 18, 23, 0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  searchResultItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  searchResultMeta: {
    flex: 1,
    gap: 2,
  },
  searchResultCodes: {
    alignItems: 'flex-end',
  },
  searchResultTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchResultSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  searchResultCode: {
    color: '#7ed9ff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchResultCodeMuted: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '600',
  },
  searchResultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchResultClose: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    fontWeight: '700',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0e1217',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetAction: {
    color: '#7ed9ff',
    fontSize: 14,
    fontWeight: '600',
  },
  sheetClose: {
    color: '#7ed9ff',
    fontSize: 14,
    fontWeight: '600',
  },
  sheetContent: {
    paddingBottom: 12,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  sheetLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  sheetValue: {
    color: '#fff',
    fontSize: 12,
    maxWidth: '55%',
    textAlign: 'right',
  },
});
