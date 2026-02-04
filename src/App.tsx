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

import { FlightPositionFull, MapBounds } from './api/fr24';

const INITIAL_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const FLIGHT_MARKER_IMAGE = require('../assets/a380.png');

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [fakeFlights, setFakeFlights] = useState<FlightPositionFull[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightPositionFull | null>(null);
  const [sheetState, setSheetState] = useState<'collapsed' | 'half' | 'full'>('collapsed');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const lastRegionRef = useRef<Region | null>(null);
  const { height: screenHeight } = useWindowDimensions();
  const sheetHalfHeight = useMemo(() => Math.round(screenHeight * 0.5), [screenHeight]);
  const sheetFullHeight = useMemo(() => Math.round(screenHeight * 0.92), [screenHeight]);
  const sheetCollapsedHeight = 96;
  const sheetTranslateY = useRef(new Animated.Value(screenHeight)).current;
  const insets = useSafeAreaInsets();

  const generateFakeFlights = useCallback((bounds: MapBounds) => {
    const flights: FlightPositionFull[] = [];
    for (let i = 0; i < 10; i += 1) {
      const lat = bounds.south + Math.random() * (bounds.north - bounds.south);
      const lon = bounds.west + Math.random() * (bounds.east - bounds.west);
      flights.push({
        fr24_id: `fake-${Date.now()}-${i}`,
        flight: `FR${100 + i}`,
        callsign: `FAKE${100 + i}`,
        lat,
        lon,
        track: Math.floor(Math.random() * 360),
        alt: 30000 + Math.floor(Math.random() * 5000),
        gspeed: 420 + Math.floor(Math.random() * 60),
        vspeed: 0,
        squawk: '0000',
        timestamp: new Date().toISOString(),
        source: 'sim',
        hex: null,
        type: 'A320',
        reg: null,
        painted_as: null,
        operating_as: null,
        orig_iata: null,
        orig_icao: null,
        dest_iata: null,
        dest_icao: null,
        eta: null,
      });
    }
    return flights;
  }, []);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      lastRegionRef.current = region;
      const north = region.latitude + region.latitudeDelta / 2;
      const south = region.latitude - region.latitudeDelta / 2;
      const east = region.longitude + region.longitudeDelta / 2;
      const west = region.longitude - region.longitudeDelta / 2;
      
      const bounds: MapBounds = { north, south, east, west };
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        if (inFlightRef.current) {
          inFlightRef.current.abort();
        }

        const controller = new AbortController();
        inFlightRef.current = controller;

        const flights = generateFakeFlights(bounds);
        setFakeFlights(flights);
/*         getLiveFlightPositionsFull(FR24_API_KEY, { bounds, signal: controller.signal })
          .then((response) => {
            setFlightCount(response.data.length);
          })
          .catch((error: unknown) => {
            if (error instanceof Error && error.name === 'AbortError') {
              return;
            }
            console.warn('Failed to fetch live flight positions:', error);
          });
 */

      }, 600);
    },
    [],
  );

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
        {fakeFlights.map((flight) => (
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
        />
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
