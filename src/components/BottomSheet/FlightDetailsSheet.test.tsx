import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FlightDetailsSheet } from './FlightDetailsSheet';
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

const defaultProps = {
  flight: mockFlight,
  sheetState: 'half' as const,
  sheetIndex: 1,
  snapPoints: [96, '50%', '92%'],
  onSheetChange: jest.fn(),
  onSheetClose: jest.fn(),
  onCycleState: jest.fn(),
};

describe('FlightDetailsSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with flight number as title', () => {
    const { getByTestId } = render(<FlightDetailsSheet {...defaultProps} />);

    expect(getByTestId('sheet-title')).toHaveTextContent('UA123');
  });

  it('uses callsign when flight is null', () => {
    const flightWithoutNumber = { ...mockFlight, flight: null };
    const { getByTestId } = render(
      <FlightDetailsSheet {...defaultProps} flight={flightWithoutNumber} />
    );

    expect(getByTestId('sheet-title')).toHaveTextContent('UAL123');
  });

  it('uses default title when both flight and callsign are null', () => {
    const flightWithoutBoth = { ...mockFlight, flight: null, callsign: null };
    const { getByTestId } = render(
      <FlightDetailsSheet {...defaultProps} flight={flightWithoutBoth} />
    );

    expect(getByTestId('sheet-title')).toHaveTextContent('Flight Details');
  });

  it('calls onCycleState when handle is pressed', () => {
    const onCycleState = jest.fn();
    const { getByTestId } = render(
      <FlightDetailsSheet {...defaultProps} onCycleState={onCycleState} />
    );

    fireEvent.press(getByTestId('sheet-handle'));

    expect(onCycleState).toHaveBeenCalledTimes(1);
  });
});
