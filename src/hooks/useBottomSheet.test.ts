import { renderHook, act } from '@testing-library/react-native';
import { useBottomSheet } from './useBottomSheet';
import { FlightPositionFull } from '../types/flight';

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
  painted_as: 'United Airlines',
  operating_as: 'United Airlines',
  orig_iata: 'SFO',
  orig_icao: 'KSFO',
  dest_iata: 'LAX',
  dest_icao: 'KLAX',
  eta: '2024-01-01T02:00:00Z',
};

describe('useBottomSheet', () => {
  it('initializes with collapsed state and no selected flight', () => {
    const { result } = renderHook(() => useBottomSheet());

    expect(result.current.sheetState).toBe('collapsed');
    expect(result.current.sheetIndex).toBe(0);
    expect(result.current.selectedFlight).toBeNull();
  });

  it('provides snap points for collapsed, half, and full states', () => {
    const { result } = renderHook(() => useBottomSheet());

    expect(result.current.snapPoints[0]).toBe(96);
    expect(result.current.snapPoints[1]).toBe('50%');
    expect(result.current.snapPoints[2]).toBe('92%');
  });

  it('openSheet transitions to half state', () => {
    const { result } = renderHook(() => useBottomSheet());

    act(() => {
      result.current.setSelectedFlight(mockFlight);
      result.current.openSheet();
    });

    expect(result.current.sheetState).toBe('half');
    expect(result.current.sheetIndex).toBe(1);
  });

  it('expandSheetFull transitions to full state', () => {
    const { result } = renderHook(() => useBottomSheet());

    act(() => {
      result.current.setSelectedFlight(mockFlight);
      result.current.expandSheetFull();
    });

    expect(result.current.sheetState).toBe('full');
    expect(result.current.sheetIndex).toBe(2);
  });

  it('collapseSheet transitions to collapsed state', () => {
    const { result } = renderHook(() => useBottomSheet());

    act(() => {
      result.current.setSelectedFlight(mockFlight);
      result.current.openSheet();
    });

    expect(result.current.sheetState).toBe('half');

    act(() => {
      result.current.collapseSheet();
    });

    expect(result.current.sheetState).toBe('collapsed');
    expect(result.current.sheetIndex).toBe(0);
  });

  it('cycleSheetState cycles through states correctly', () => {
    const { result } = renderHook(() => useBottomSheet());

    expect(result.current.sheetState).toBe('collapsed');
    expect(result.current.sheetIndex).toBe(0);

    act(() => {
      result.current.cycleSheetState();
    });
    expect(result.current.sheetState).toBe('half');
    expect(result.current.sheetIndex).toBe(1);

    act(() => {
      result.current.cycleSheetState();
    });
    expect(result.current.sheetState).toBe('full');
    expect(result.current.sheetIndex).toBe(2);

    act(() => {
      result.current.cycleSheetState();
    });
    expect(result.current.sheetState).toBe('collapsed');
    expect(result.current.sheetIndex).toBe(0);
  });

  it('setSelectedFlight updates selected flight', () => {
    const { result } = renderHook(() => useBottomSheet());

    act(() => {
      result.current.setSelectedFlight(mockFlight);
    });

    expect(result.current.selectedFlight).toEqual(mockFlight);
  });

  it('closeSheet sets sheet index to -1', () => {
    const { result } = renderHook(() => useBottomSheet());

    act(() => {
      result.current.closeSheet();
    });

    expect(result.current.sheetIndex).toBe(-1);
  });

  it('handleSheetClose clears selected flight and resets index', () => {
    const { result } = renderHook(() => useBottomSheet());

    act(() => {
      result.current.setSelectedFlight(mockFlight);
      result.current.expandSheetFull();
    });

    expect(result.current.sheetIndex).toBe(2);

    act(() => {
      result.current.handleSheetClose();
    });

    expect(result.current.selectedFlight).toBeNull();
    expect(result.current.sheetIndex).toBe(0);
  });
});
