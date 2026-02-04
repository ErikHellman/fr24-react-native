import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { FlightPositionFull, getLiveFlightPositionsFull, MapBounds } from './api/fr24';

const INITIAL_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const FR24_API_KEY = process.env.EXPO_PUBLIC_FR24_API_KEY ?? '';
const FLIGHT_MARKER_IMAGE = require('../assets/a380.png');

export default function App() {
  const [flightCount, setFlightCount] = useState(0);
  const [fakeFlights, setFakeFlights] = useState<FlightPositionFull[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);

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
        setFlightCount(flights.length);

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
  
  return (
    <View style={styles.container}>
      <MapView
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
          />
        ))}
      </MapView>
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
});
