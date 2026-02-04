import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlightPositionFull } from '../../types/flight';
import { AirportEntry } from '../../types/airport';
import { Region, INITIAL_REGION } from '../../constants/map';

export type FlightMapProps = {
  airports: AirportEntry[];
  flights: FlightPositionFull[];
  onRegionChangeComplete: (region: Region) => void;
  onFlightPress: (flight: FlightPositionFull) => void;
  onAirportPress: (airport: AirportEntry) => void;
};

export type FlightMapRef = {
  animateToRegion: (region: Region, duration?: number) => void;
};

export const FlightMap = forwardRef<FlightMapRef, FlightMapProps>(
  ({ airports, flights, onRegionChangeComplete }, ref) => {
    useImperativeHandle(ref, () => ({
      animateToRegion: () => {
        // No-op on web
      },
    }));

    // Trigger initial region callback
    React.useEffect(() => {
      onRegionChangeComplete(INITIAL_REGION);
    }, [onRegionChangeComplete]);

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Flight Radar</Text>
          <Text style={styles.subtitle}>
            Maps are only available on iOS and Android
          </Text>
          <View style={styles.stats}>
            <Text style={styles.statText}>
              {flights.length} flights tracked
            </Text>
            <Text style={styles.statText}>
              {airports.length} airports visible
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

FlightMap.displayName = 'FlightMap';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1217',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7ed9ff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  stats: {
    backgroundColor: 'rgba(126, 217, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(126, 217, 255, 0.3)',
  },
  statText: {
    fontSize: 16,
    color: '#7ed9ff',
    marginVertical: 4,
  },
});
