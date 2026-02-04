import React from 'react';
import { AirportEntry } from '../../types/airport';

export type AirportMarkerProps = {
  airport: AirportEntry;
  onPress: (airport: AirportEntry) => void;
};

// Stub component for web - markers are not rendered without a map
export const AirportMarker: React.FC<AirportMarkerProps> = () => {
  return null;
};
