import { useCallback, useRef, useState } from 'react';
import { Region } from 'react-native-maps';
import { MapBounds } from '../types/flight';
import { INITIAL_REGION } from '../constants/map';

export type UseMapRegionReturn = {
  mapBounds: MapBounds | null;
  lastRegion: Region | null;
  initialRegion: Region;
  handleRegionChangeComplete: (region: Region) => void;
};

export const useMapRegion = (): UseMapRegionReturn => {
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const lastRegionRef = useRef<Region | null>(null);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    lastRegionRef.current = region;
    const north = region.latitude + region.latitudeDelta / 2;
    const south = region.latitude - region.latitudeDelta / 2;
    const east = region.longitude + region.longitudeDelta / 2;
    const west = region.longitude - region.longitudeDelta / 2;

    const bounds: MapBounds = { north, south, east, west };
    setMapBounds(bounds);
  }, []);

  return {
    mapBounds,
    lastRegion: lastRegionRef.current,
    initialRegion: INITIAL_REGION,
    handleRegionChangeComplete,
  };
};
