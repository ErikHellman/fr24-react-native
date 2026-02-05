import React from 'react';
import { FlightPositionFull } from '../../types/flight';

export type FlightMarkerProps = {
  flight: FlightPositionFull;
  onPress: (flight: FlightPositionFull) => void;
};

export const FlightMarker: React.FC<FlightMarkerProps> = () => null;
