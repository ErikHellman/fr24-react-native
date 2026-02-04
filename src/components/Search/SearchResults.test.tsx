import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchResults } from './SearchResults';
import { AirportEntry } from '../../types/airport';

const mockAirports: AirportEntry[] = [
  {
    name: 'San Francisco International Airport',
    iata: 'SFO',
    icao: 'KSFO',
    city: 'San Francisco',
    country: 'United States',
    coordinates: { latitude: 37.6213, longitude: -122.379 },
  },
  {
    name: 'Los Angeles International Airport',
    iata: 'LAX',
    icao: 'KLAX',
    city: 'Los Angeles',
    country: 'United States',
    coordinates: { latitude: 33.9425, longitude: -118.408 },
  },
];

describe('SearchResults', () => {
  it('renders nothing when airports array is empty', () => {
    const { toJSON } = render(
      <SearchResults airports={[]} onSelect={jest.fn()} />
    );

    expect(toJSON()).toBeNull();
  });

  it('renders list of airports', () => {
    const { getByText } = render(
      <SearchResults airports={mockAirports} onSelect={jest.fn()} />
    );

    expect(getByText('San Francisco International Airport')).toBeTruthy();
    expect(getByText('Los Angeles International Airport')).toBeTruthy();
  });

  it('displays airport city and country', () => {
    const { getByText } = render(
      <SearchResults airports={mockAirports} onSelect={jest.fn()} />
    );

    expect(getByText('San Francisco, United States')).toBeTruthy();
    expect(getByText('Los Angeles, United States')).toBeTruthy();
  });

  it('displays IATA codes', () => {
    const { getByText } = render(
      <SearchResults airports={mockAirports} onSelect={jest.fn()} />
    );

    expect(getByText('SFO')).toBeTruthy();
    expect(getByText('LAX')).toBeTruthy();
  });

  it('displays ICAO codes', () => {
    const { getByText } = render(
      <SearchResults airports={mockAirports} onSelect={jest.fn()} />
    );

    expect(getByText('KSFO')).toBeTruthy();
    expect(getByText('KLAX')).toBeTruthy();
  });

  it('calls onSelect when airport is pressed', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <SearchResults airports={mockAirports} onSelect={onSelect} />
    );

    fireEvent.press(getByTestId('search-result-SFO'));

    expect(onSelect).toHaveBeenCalledWith(mockAirports[0]);
  });

  it('calls onSelect with correct airport for each item', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <SearchResults airports={mockAirports} onSelect={onSelect} />
    );

    fireEvent.press(getByTestId('search-result-LAX'));

    expect(onSelect).toHaveBeenCalledWith(mockAirports[1]);
  });

  it('renders single airport correctly', () => {
    const { getByText, queryByText } = render(
      <SearchResults airports={[mockAirports[0]]} onSelect={jest.fn()} />
    );

    expect(getByText('San Francisco International Airport')).toBeTruthy();
    expect(queryByText('Los Angeles International Airport')).toBeNull();
  });
});
