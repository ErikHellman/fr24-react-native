import React from 'react';
import { Marker } from 'react-native-maps';
import { AirportEntry } from '../../types/airport';

export type AirportMarkerProps = {
  airport: AirportEntry;
  onPress: (airport: AirportEntry) => void;
};

export const AirportMarker: React.FC<AirportMarkerProps> = ({ airport, onPress }) => {
  const description = `${airport.city}, ${airport.country} • ${airport.iata}`;

  return (
    <Marker
      key={airport.iata}
      identifier={airport.iata}
      coordinate={{
        latitude: airport.coordinates.latitude,
        longitude: airport.coordinates.longitude,
      }}
      title={airport.name}
      description={description}
      onPress={() => onPress(airport)}
    />
  );
};
