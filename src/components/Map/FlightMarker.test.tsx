import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FlightMarker } from './FlightMarker';
import { FlightPositionFull } from '../../types/flight';

// Note: react-native-maps is mocked in jest.setup.js

const mockFlight: FlightPositionFull = {
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
};

describe('FlightMarker', () => {
  it('renders marker', () => {
    const { getByTestId } = render(
      <FlightMarker flight={mockFlight} onPress={jest.fn()} />
    );

    expect(getByTestId('map-marker')).toBeTruthy();
  });

  it('passes correct coordinate', () => {
    const { getByTestId } = render(
      <FlightMarker flight={mockFlight} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.coordinate).toEqual({
      latitude: 37.7749,
      longitude: -122.4194,
    });
  });

  it('uses flight number as title', () => {
    const { getByTestId } = render(
      <FlightMarker flight={mockFlight} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.title).toBe('UA123');
  });

  it('uses callsign when flight is null', () => {
    const flightWithoutNumber = { ...mockFlight, flight: null };
    const { getByTestId } = render(
      <FlightMarker flight={flightWithoutNumber} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.title).toBe('UAL123');
  });

  it('uses "Unknown flight" when both flight and callsign are null', () => {
    const flightWithoutBoth = { ...mockFlight, flight: null, callsign: null };
    const { getByTestId } = render(
      <FlightMarker flight={flightWithoutBoth} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.title).toBe('Unknown flight');
  });

  it('formats description with altitude and speed', () => {
    const { getByTestId } = render(
      <FlightMarker flight={mockFlight} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.description).toBe('35000 ft • 450 kt');
  });

  it('applies rotation from track', () => {
    const { getByTestId } = render(
      <FlightMarker flight={mockFlight} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.rotation).toBe(180);
  });

  it('calls onPress with flight when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <FlightMarker flight={mockFlight} onPress={onPress} />
    );

    fireEvent.press(getByTestId('map-marker'));

    expect(onPress).toHaveBeenCalledWith(mockFlight);
  });
});
