import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { FlightPositionFull } from '../../types/flight';
import { AirportEntry } from '../../types/airport';
import { INITIAL_REGION } from '../../constants/map';
import { FlightMarker } from './FlightMarker';
import { AirportMarker } from './AirportMarker';

export type FlightMapProps = {
  airports: AirportEntry[];
  flights: FlightPositionFull[];
  onRegionChangeComplete: (region: Region) => void;
  onFlightPress: (flight: FlightPositionFull) => void;
  onAirportPress: (airport: AirportEntry) => void;
};

export const FlightMap = forwardRef<MapView, FlightMapProps>(
  ({ airports, flights, onRegionChangeComplete, onFlightPress, onAirportPress }, ref) => {
    return (
      <MapView
        ref={ref}
        testID="flight-map"
        style={styles.map}
        loadingEnabled
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {airports.map((airport) => (
          <AirportMarker key={airport.iata} airport={airport} onPress={onAirportPress} />
        ))}
        {flights.map((flight) => (
          <FlightMarker key={flight.fr24_id} flight={flight} onPress={onFlightPress} />
        ))}
      </MapView>
    );
  }
);

FlightMap.displayName = 'FlightMap';

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
