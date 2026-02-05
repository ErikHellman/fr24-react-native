import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlightPositionFull,
  MapBounds,
  getLiveFlightPositionsFull,
  getLiveFlightPositionsFullByAirport,
} from '../api/fr24';
import { FLIGHT_REFRESH_INTERVAL } from '../constants/map';

const FR24_API_KEY = process.env.EXPO_PUBLIC_FR24_API_KEY ?? '';

export type UseFlightDataReturn = {
  visibleFlights: FlightPositionFull[];
  isLoading: boolean;
  error: Error | null;
};

export type UseFlightDataParams = {
  mapBounds: MapBounds | null;
  airportSearchCode: string | null;
};

export const useFlightData = ({
  mapBounds,
  airportSearchCode,
}: UseFlightDataParams): UseFlightDataReturn => {
  const [visibleFlights, setVisibleFlights] = useState<FlightPositionFull[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);
  const sortByAltitudeAsc = useCallback(
    (flights: FlightPositionFull[]) => [...flights].sort((a, b) => a.alt - b.alt),
    []
  );

  const fetchLiveFlights = useCallback((bounds: MapBounds) => {
    if (inFlightRef.current) {
      inFlightRef.current.abort();
    }

    const controller = new AbortController();
    inFlightRef.current = controller;

    setIsLoading(true);
    setError(null);

    getLiveFlightPositionsFull(FR24_API_KEY, { bounds, signal: controller.signal })
      .then((response) => {
        setVisibleFlights(sortByAltitudeAsc(response.data));
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.warn('Failed to fetch live flight positions:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      });
  }, []);

  const fetchLiveFlightsByAirport = useCallback((airportCode: string) => {
    if (inFlightRef.current) {
      inFlightRef.current.abort();
    }

    const controller = new AbortController();
    inFlightRef.current = controller;

    setIsLoading(true);
    setError(null);

    getLiveFlightPositionsFullByAirport(FR24_API_KEY, { airportCode, signal: controller.signal })
      .then((response) => {
        setVisibleFlights(sortByAltitudeAsc(response.data));
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.warn('Failed to fetch flights by airport:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      });
  }, []);

  // Fetch by airport code when one is selected
  useEffect(() => {
    if (!airportSearchCode) {
      return;
    }

    fetchLiveFlightsByAirport(airportSearchCode);
    const intervalId = setInterval(() => {
      fetchLiveFlightsByAirport(airportSearchCode);
    }, FLIGHT_REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
      if (inFlightRef.current) {
        inFlightRef.current.abort();
      }
    };
  }, [airportSearchCode, fetchLiveFlightsByAirport]);

  // Fetch by map bounds when no airport is selected
  useEffect(() => {
    if (airportSearchCode || !mapBounds) {
      return;
    }

    fetchLiveFlights(mapBounds);
    const intervalId = setInterval(() => {
      fetchLiveFlights(mapBounds);
    }, FLIGHT_REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
      if (inFlightRef.current) {
        inFlightRef.current.abort();
      }
    };
  }, [airportSearchCode, fetchLiveFlights, mapBounds]);

  return {
    visibleFlights,
    isLoading,
    error,
  };
};
