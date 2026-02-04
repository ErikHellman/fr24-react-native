import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFlightData } from './useFlightData';
import * as fr24Api from '../api/fr24';

// Mock the API module
jest.mock('../api/fr24', () => ({
  getLiveFlightPositionsFull: jest.fn(),
  getLiveFlightPositionsFullByAirport: jest.fn(),
}));

const mockFlights = [
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

const mockBounds = {
  north: 38,
  south: 37,
  east: -122,
  west: -123,
};

describe('useFlightData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with empty flights and no error', () => {
    const { result } = renderHook(() =>
      useFlightData({ mapBounds: null, airportSearchCode: null })
    );

    expect(result.current.visibleFlights).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('fetches flights when mapBounds changes', async () => {
    (fr24Api.getLiveFlightPositionsFull as jest.Mock).mockResolvedValue({
      data: mockFlights,
    });

    const { result } = renderHook(() =>
      useFlightData({ mapBounds: mockBounds, airportSearchCode: null })
    );

    await waitFor(() => {
      expect(result.current.visibleFlights).toEqual(mockFlights);
    });

    expect(fr24Api.getLiveFlightPositionsFull).toHaveBeenCalled();
  });

  it('fetches flights by airport when airportSearchCode is set', async () => {
    (fr24Api.getLiveFlightPositionsFullByAirport as jest.Mock).mockResolvedValue({
      data: mockFlights,
    });

    const { result } = renderHook(() =>
      useFlightData({ mapBounds: mockBounds, airportSearchCode: 'SFO' })
    );

    await waitFor(() => {
      expect(result.current.visibleFlights).toEqual(mockFlights);
    });

    expect(fr24Api.getLiveFlightPositionsFullByAirport).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ airportCode: 'SFO' })
    );
  });

  it('prioritizes airport search over bounds search', async () => {
    (fr24Api.getLiveFlightPositionsFullByAirport as jest.Mock).mockResolvedValue({
      data: mockFlights,
    });

    renderHook(() =>
      useFlightData({ mapBounds: mockBounds, airportSearchCode: 'SFO' })
    );

    await waitFor(() => {
      expect(fr24Api.getLiveFlightPositionsFullByAirport).toHaveBeenCalled();
    });

    expect(fr24Api.getLiveFlightPositionsFull).not.toHaveBeenCalled();
  });

  it('does not fetch when both mapBounds and airportSearchCode are null', () => {
    renderHook(() =>
      useFlightData({ mapBounds: null, airportSearchCode: null })
    );

    expect(fr24Api.getLiveFlightPositionsFull).not.toHaveBeenCalled();
    expect(fr24Api.getLiveFlightPositionsFullByAirport).not.toHaveBeenCalled();
  });

  it('sets up refresh interval', async () => {
    (fr24Api.getLiveFlightPositionsFull as jest.Mock).mockResolvedValue({
      data: mockFlights,
    });

    renderHook(() =>
      useFlightData({ mapBounds: mockBounds, airportSearchCode: null })
    );

    // Initial fetch
    expect(fr24Api.getLiveFlightPositionsFull).toHaveBeenCalledTimes(1);

    // Advance timer by 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(fr24Api.getLiveFlightPositionsFull).toHaveBeenCalledTimes(2);
    });
  });

  it('clears interval on unmount', async () => {
    (fr24Api.getLiveFlightPositionsFull as jest.Mock).mockResolvedValue({
      data: mockFlights,
    });

    const { unmount } = renderHook(() =>
      useFlightData({ mapBounds: mockBounds, airportSearchCode: null })
    );

    expect(fr24Api.getLiveFlightPositionsFull).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Should still be 1 because interval was cleared
    expect(fr24Api.getLiveFlightPositionsFull).toHaveBeenCalledTimes(1);
  });

  it('handles fetch errors gracefully', async () => {
    const testError = new Error('Network error');
    (fr24Api.getLiveFlightPositionsFull as jest.Mock).mockRejectedValue(testError);

    const { result } = renderHook(() =>
      useFlightData({ mapBounds: mockBounds, airportSearchCode: null })
    );

    await waitFor(() => {
      expect(result.current.error).toEqual(testError);
    });

    expect(result.current.visibleFlights).toEqual([]);
  });

  it('ignores AbortError', async () => {
    // Use real timers for this test since we're testing async behavior
    jest.useRealTimers();

    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    (fr24Api.getLiveFlightPositionsFull as jest.Mock).mockRejectedValue(abortError);

    const { result } = renderHook(() =>
      useFlightData({ mapBounds: mockBounds, airportSearchCode: null })
    );

    // Wait for the rejection to be processed
    await act(async () => {
      await Promise.resolve();
    });

    // AbortError should not be set as error
    expect(result.current.error).toBeNull();

    // Restore fake timers for other tests
    jest.useFakeTimers();
  });
});
