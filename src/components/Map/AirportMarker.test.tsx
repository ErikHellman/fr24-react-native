import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AirportMarker } from './AirportMarker';
import { AirportEntry } from '../../types/airport';

const mockAirport: AirportEntry = {
  name: 'San Francisco International Airport',
  iata: 'SFO',
  icao: 'KSFO',
  city: 'San Francisco',
  country: 'United States',
  coordinates: { latitude: 37.6213, longitude: -122.379 },
};

describe('AirportMarker', () => {
  it('renders marker', () => {
    const { getByTestId } = render(
      <AirportMarker airport={mockAirport} onPress={jest.fn()} />
    );

    expect(getByTestId('map-marker')).toBeTruthy();
  });

  it('passes correct coordinate', () => {
    const { getByTestId } = render(
      <AirportMarker airport={mockAirport} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.coordinate).toEqual({
      latitude: 37.6213,
      longitude: -122.379,
    });
  });

  it('uses airport name as title', () => {
    const { getByTestId } = render(
      <AirportMarker airport={mockAirport} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.title).toBe('San Francisco International Airport');
  });

  it('formats description with city, country, and IATA code', () => {
    const { getByTestId } = render(
      <AirportMarker airport={mockAirport} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.description).toBe('San Francisco, United States • SFO');
  });

  it('calls onPress with airport when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <AirportMarker airport={mockAirport} onPress={onPress} />
    );

    fireEvent.press(getByTestId('map-marker'));

    expect(onPress).toHaveBeenCalledWith(mockAirport);
  });

  it('uses IATA as identifier', () => {
    const { getByTestId } = render(
      <AirportMarker airport={mockAirport} onPress={jest.fn()} />
    );

    const marker = getByTestId('map-marker');
    expect(marker.props.identifier).toBe('SFO');
  });
});
