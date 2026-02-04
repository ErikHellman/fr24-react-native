import { renderHook, act } from '@testing-library/react-native';
import { useMapRegion } from './useMapRegion';
import { INITIAL_REGION } from '../constants/map';

describe('useMapRegion', () => {
  it('initializes with null bounds', () => {
    const { result } = renderHook(() => useMapRegion());

    expect(result.current.mapBounds).toBeNull();
  });

  it('provides initial region constant', () => {
    const { result } = renderHook(() => useMapRegion());

    expect(result.current.initialRegion).toEqual(INITIAL_REGION);
  });

  it('calculates bounds from region', () => {
    const { result } = renderHook(() => useMapRegion());

    act(() => {
      result.current.handleRegionChangeComplete({
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 1.0,
        longitudeDelta: 1.0,
      });
    });

    expect(result.current.mapBounds).toEqual({
      north: 38.2749,
      south: 37.2749,
      east: -121.9194,
      west: -122.9194,
    });
  });

  it('calculates correct bounds for different deltas', () => {
    const { result } = renderHook(() => useMapRegion());

    act(() => {
      result.current.handleRegionChangeComplete({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 2.0,
        longitudeDelta: 4.0,
      });
    });

    expect(result.current.mapBounds).toEqual({
      north: 1.0,
      south: -1.0,
      east: 2.0,
      west: -2.0,
    });
  });

  it('updates bounds on subsequent region changes', () => {
    const { result } = renderHook(() => useMapRegion());

    act(() => {
      result.current.handleRegionChangeComplete({
        latitude: 10,
        longitude: 10,
        latitudeDelta: 1.0,
        longitudeDelta: 1.0,
      });
    });

    expect(result.current.mapBounds?.north).toBe(10.5);

    act(() => {
      result.current.handleRegionChangeComplete({
        latitude: 20,
        longitude: 20,
        latitudeDelta: 1.0,
        longitudeDelta: 1.0,
      });
    });

    expect(result.current.mapBounds?.north).toBe(20.5);
  });
});
