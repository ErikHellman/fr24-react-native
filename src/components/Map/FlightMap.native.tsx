import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { INITIAL_REGION } from '../../constants/map';
import { MapRefHandle } from '../../types/map';
import { FlightMarker } from './FlightMarker';
import { AirportMarker } from './AirportMarker';
import { FlightMapProps } from './types';

export const FlightMap = forwardRef<MapRefHandle, FlightMapProps>(
  ({ airports, flights, onRegionChangeComplete, onFlightPress, onAirportPress }, ref) => {
    const mapViewRef = useRef<MapView | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        animateToRegion: (region, duration) => {
          mapViewRef.current?.animateToRegion(region, duration);
        },
      }),
      []
    );

    return (
      <MapView
        ref={mapViewRef}
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
