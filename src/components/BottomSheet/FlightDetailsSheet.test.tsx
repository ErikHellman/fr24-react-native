import React from 'react';
import { Animated } from 'react-native';
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
  sheetTranslateY: new Animated.Value(0),
  sheetFullHeight: 800,
  onCycleState: jest.fn(),
  onExpand: jest.fn(),
  onCollapse: jest.fn(),
  onClose: jest.fn(),
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

  it('shows Expand button when not in full state', () => {
    const { getByTestId, queryByTestId } = render(
      <FlightDetailsSheet {...defaultProps} sheetState="half" />
    );

    expect(getByTestId('expand-button')).toBeTruthy();
    expect(queryByTestId('collapse-button')).toBeNull();
  });

  it('shows Collapse button when in full state', () => {
    const { getByTestId, queryByTestId } = render(
      <FlightDetailsSheet {...defaultProps} sheetState="full" />
    );

    expect(getByTestId('collapse-button')).toBeTruthy();
    expect(queryByTestId('expand-button')).toBeNull();
  });

  it('calls onExpand when Expand is pressed', () => {
    const onExpand = jest.fn();
    const { getByTestId } = render(
      <FlightDetailsSheet {...defaultProps} onExpand={onExpand} sheetState="half" />
    );

    fireEvent.press(getByTestId('expand-button'));

    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('calls onCollapse when Collapse is pressed', () => {
    const onCollapse = jest.fn();
    const { getByTestId } = render(
      <FlightDetailsSheet {...defaultProps} onCollapse={onCollapse} sheetState="full" />
    );

    fireEvent.press(getByTestId('collapse-button'));

    expect(onCollapse).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Close is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <FlightDetailsSheet {...defaultProps} onClose={onClose} />
    );

    fireEvent.press(getByTestId('close-button'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <FlightDetailsSheet {...defaultProps} onClose={onClose} sheetState="half" />
    );

    fireEvent.press(getByTestId('sheet-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render backdrop when collapsed', () => {
    const { queryByTestId } = render(
      <FlightDetailsSheet {...defaultProps} sheetState="collapsed" />
    );

    expect(queryByTestId('sheet-backdrop')).toBeNull();
  });

  it('renders backdrop when in half state', () => {
    const { getByTestId } = render(
      <FlightDetailsSheet {...defaultProps} sheetState="half" />
    );

    expect(getByTestId('sheet-backdrop')).toBeTruthy();
  });

  it('renders backdrop when in full state', () => {
    const { getByTestId } = render(
      <FlightDetailsSheet {...defaultProps} sheetState="full" />
    );

    expect(getByTestId('sheet-backdrop')).toBeTruthy();
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
