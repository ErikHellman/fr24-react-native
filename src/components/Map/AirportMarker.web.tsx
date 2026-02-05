import React from 'react';
import { AirportEntry } from '../../types/airport';

export type AirportMarkerProps = {
  airport: AirportEntry;
  onPress: (airport: AirportEntry) => void;
};

export const AirportMarker: React.FC<AirportMarkerProps> = () => null;
