import { FlightPositionFull } from '../../types/flight';
import { AirportEntry } from '../../types/airport';
import { MapRegion } from '../../types/map';

export type FlightMapProps = {
  airports: AirportEntry[];
  flights: FlightPositionFull[];
  onRegionChangeComplete: (region: MapRegion) => void;
  onFlightPress: (flight: FlightPositionFull) => void;
  onAirportPress: (airport: AirportEntry) => void;
};
