import React from 'react';
import { Marker } from 'react-native-maps';
import { FlightPositionFull } from '../../types/flight';
import { FLIGHT_MARKER_IMAGE } from '../../constants/map';

export type FlightMarkerProps = {
  flight: FlightPositionFull;
  onPress: (flight: FlightPositionFull) => void;
};

export const FlightMarker: React.FC<FlightMarkerProps> = ({ flight, onPress }) => {
  const title = flight.flight ?? flight.callsign ?? 'Unknown flight';
  const description = `${flight.alt} ft • ${flight.gspeed} kt`;

  return (
    <Marker
      key={flight.fr24_id}
      identifier={flight.fr24_id}
      coordinate={{ latitude: flight.lat, longitude: flight.lon }}
      title={title}
      description={description}
      rotation={flight.track}
      image={FLIGHT_MARKER_IMAGE}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={() => onPress(flight)}
    />
  );
};
