import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { INITIAL_REGION } from '../../constants/map';
import { MapRefHandle } from '../../types/map';
import { FlightMapProps } from './types';

export const FlightMap = forwardRef<MapRefHandle, FlightMapProps>(
  ({ onRegionChangeComplete }, ref) => {
    useImperativeHandle(
      ref,
      () => ({
        animateToRegion: () => {},
      }),
      []
    );

    useEffect(() => {
      onRegionChangeComplete(INITIAL_REGION);
    }, [onRegionChangeComplete]);

    return (
      <View testID="flight-map" style={styles.map}>
        <Text style={styles.title}>Map unavailable on web</Text>
        <Text style={styles.subtitle}>
          Web export omits the native map. Use iOS or Android for full tracking.
        </Text>
      </View>
    );
  }
);

FlightMap.displayName = 'FlightMap';

const styles = StyleSheet.create({
  map: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(14, 18, 23, 0.9)',
  },
  title: {
    color: '#e6f6ff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: '#9fb2c1',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
