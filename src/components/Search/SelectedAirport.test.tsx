import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SelectedAirport, NoResults } from './SelectedAirport';
import { AirportEntry } from '../../types/airport';

const mockAirport: AirportEntry = {
  name: 'San Francisco International Airport',
  iata: 'SFO',
  icao: 'KSFO',
  city: 'San Francisco',
  country: 'United States',
  coordinates: { latitude: 37.6213, longitude: -122.379 },
};

describe('SelectedAirport', () => {
  it('displays airport name', () => {
    const { getByText } = render(
      <SelectedAirport airport={mockAirport} onClose={jest.fn()} />
    );

    expect(getByText('San Francisco International Airport')).toBeTruthy();
  });

  it('displays airport city and country', () => {
    const { getByText } = render(
      <SelectedAirport airport={mockAirport} onClose={jest.fn()} />
    );

    expect(getByText('San Francisco, United States')).toBeTruthy();
  });

  it('displays IATA code', () => {
    const { getByText } = render(
      <SelectedAirport airport={mockAirport} onClose={jest.fn()} />
    );

    expect(getByText('SFO')).toBeTruthy();
  });

  it('displays ICAO code', () => {
    const { getByText } = render(
      <SelectedAirport airport={mockAirport} onClose={jest.fn()} />
    );

    expect(getByText('KSFO')).toBeTruthy();
  });

  it('calls onClose when X button is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <SelectedAirport airport={mockAirport} onClose={onClose} />
    );

    fireEvent.press(getByTestId('close-button'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders close button with X text', () => {
    const { getByText } = render(
      <SelectedAirport airport={mockAirport} onClose={jest.fn()} />
    );

    expect(getByText('X')).toBeTruthy();
  });
});

describe('NoResults', () => {
  it('displays no airports found message', () => {
    const { getByText } = render(<NoResults onClose={jest.fn()} />);

    expect(getByText('No airports found.')).toBeTruthy();
  });

  it('calls onClose when X button is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<NoResults onClose={onClose} />);

    fireEvent.press(getByTestId('no-results-close-button'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders close button with X text', () => {
    const { getByText } = render(<NoResults onClose={jest.fn()} />);

    expect(getByText('X')).toBeTruthy();
  });
});
