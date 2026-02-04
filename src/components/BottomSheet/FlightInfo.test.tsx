import React from 'react';
import { render } from '@testing-library/react-native';
import { FlightInfo } from './FlightInfo';
import { FlightPositionFull } from '../../types/flight';

const mockFlight: FlightPositionFull = {
  fr24_id: 'abc123',
  flight: 'UA123',
  callsign: 'UAL123',
  lat: 37.7749,
  lon: -122.4194,
  track: 180,
  alt: 35000,
  gspeed: 450,
  vspeed: 100,
  squawk: '1200',
  timestamp: '2024-01-01T00:00:00Z',
  source: 'ADSB',
  hex: 'ABC123',
  type: 'B738',
  reg: 'N12345',
  painted_as: 'United Airlines',
  operating_as: 'United Airlines',
  orig_iata: 'SFO',
  orig_icao: 'KSFO',
  dest_iata: 'LAX',
  dest_icao: 'KLAX',
  eta: '2024-01-01T02:00:00Z',
};

describe('FlightInfo', () => {
  it('renders all flight detail rows when not collapsed', () => {
    const { getByTestId } = render(<FlightInfo flight={mockFlight} />);

    expect(getByTestId('flight-detail-FR24 ID')).toBeTruthy();
    expect(getByTestId('flight-detail-Flight')).toBeTruthy();
    expect(getByTestId('flight-detail-Callsign')).toBeTruthy();
    expect(getByTestId('flight-detail-Altitude (ft)')).toBeTruthy();
    expect(getByTestId('flight-detail-Ground Speed (kt)')).toBeTruthy();
  });

  it('displays correct values', () => {
    const { getByText } = render(<FlightInfo flight={mockFlight} />);

    expect(getByText('abc123')).toBeTruthy();
    expect(getByText('UA123')).toBeTruthy();
    expect(getByText('UAL123')).toBeTruthy();
    expect(getByText('35000')).toBeTruthy();
    expect(getByText('450')).toBeTruthy();
  });

  it('displays labels', () => {
    const { getByText } = render(<FlightInfo flight={mockFlight} />);

    expect(getByText('FR24 ID')).toBeTruthy();
    expect(getByText('Flight')).toBeTruthy();
    expect(getByText('Callsign')).toBeTruthy();
    expect(getByText('Altitude (ft)')).toBeTruthy();
  });

  it('shows only FR24 ID and Callsign when collapsed', () => {
    const { getByTestId, queryByTestId } = render(
      <FlightInfo flight={mockFlight} collapsed />
    );

    expect(getByTestId('flight-detail-FR24 ID')).toBeTruthy();
    expect(getByTestId('flight-detail-Callsign')).toBeTruthy();
    expect(queryByTestId('flight-detail-Flight')).toBeNull();
    expect(queryByTestId('flight-detail-Altitude (ft)')).toBeNull();
  });

  it('shows "—" for null values', () => {
    const flightWithNulls: FlightPositionFull = {
      ...mockFlight,
      flight: null,
      hex: null,
      painted_as: null,
    };

    const { getAllByText } = render(<FlightInfo flight={flightWithNulls} />);

    // Should have multiple "—" characters for null values
    const dashes = getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('displays origin and destination codes', () => {
    const { getByText } = render(<FlightInfo flight={mockFlight} />);

    expect(getByText('SFO')).toBeTruthy();
    expect(getByText('KSFO')).toBeTruthy();
    expect(getByText('LAX')).toBeTruthy();
    expect(getByText('KLAX')).toBeTruthy();
  });

  it('displays aircraft registration', () => {
    const { getByText } = render(<FlightInfo flight={mockFlight} />);

    expect(getByText('N12345')).toBeTruthy();
    expect(getByText('B738')).toBeTruthy();
  });
});
