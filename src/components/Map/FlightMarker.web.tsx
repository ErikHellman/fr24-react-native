import React from 'react';
import { FlightPositionFull } from '../../types/flight';

export type FlightMarkerProps = {
  flight: FlightPositionFull;
  onPress: (flight: FlightPositionFull) => void;
};

// Stub component for web - markers are not rendered without a map
export const FlightMarker: React.FC<FlightMarkerProps> = () => {
  return null;
};
