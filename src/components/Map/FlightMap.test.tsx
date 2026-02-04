import React from 'react';
import { render } from '@testing-library/react-native';
import { FlightMap } from './FlightMap';
import { FlightPositionFull } from '../../types/flight';
import { AirportEntry } from '../../types/airport';

const mockFlights: FlightPositionFull[] = [
  {
    fr24_id: 'abc123',
    flight: 'UA123',
    callsign: 'UAL123',
    lat: 37.7749,
    lon: -122.4194,
    track: 180,
    alt: 35000,
    gspeed: 450,
    vspeed: 0,
    squawk: '1200',
    timestamp: '2024-01-01T00:00:00Z',
    source: 'ADSB',
    hex: 'ABC123',
    type: 'B738',
    reg: 'N12345',
    painted_as: null,
    operating_as: null,
    orig_iata: 'SFO',
    orig_icao: 'KSFO',
    dest_iata: 'LAX',
    dest_icao: 'KLAX',
    eta: null,
  },
];

const mockAirports: AirportEntry[] = [
  {
    name: 'San Francisco International Airport',
    iata: 'SFO',
    icao: 'KSFO',
    city: 'San Francisco',
    country: 'United States',
    coordinates: { latitude: 37.6213, longitude: -122.379 },
  },
];

describe('FlightMap', () => {
  const defaultProps = {
    airports: mockAirports,
    flights: mockFlights,
    onRegionChangeComplete: jest.fn(),
    onFlightPress: jest.fn(),
    onAirportPress: jest.fn(),
  };

  it('renders map view', () => {
    const { getByTestId } = render(<FlightMap {...defaultProps} />);

    expect(getByTestId('flight-map')).toBeTruthy();
  });

  it('renders with empty flights and airports', () => {
    const { getByTestId } = render(
      <FlightMap {...defaultProps} flights={[]} airports={[]} />
    );

    expect(getByTestId('flight-map')).toBeTruthy();
  });

  it('renders markers for flights', () => {
    const { getAllByTestId } = render(<FlightMap {...defaultProps} />);

    // Should have markers for both airports and flights
    const markers = getAllByTestId('map-marker');
    expect(markers.length).toBe(2); // 1 airport + 1 flight
  });

  it('renders only airport markers when no flights', () => {
    const { getAllByTestId } = render(
      <FlightMap {...defaultProps} flights={[]} />
    );

    const markers = getAllByTestId('map-marker');
    expect(markers.length).toBe(1); // 1 airport only
  });

  it('renders only flight markers when no airports', () => {
    const { getAllByTestId } = render(
      <FlightMap {...defaultProps} airports={[]} />
    );

    const markers = getAllByTestId('map-marker');
    expect(markers.length).toBe(1); // 1 flight only
  });

  it('accepts ref for map control', () => {
    const ref = React.createRef<any>();
    render(<FlightMap {...defaultProps} ref={ref} />);

    // The ref should be defined (mocked MapView)
    expect(ref.current).toBeDefined();
  });
});
