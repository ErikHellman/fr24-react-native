import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { FLIGHT_MARKER_IMAGE, INITIAL_REGION } from '../../constants/map';
import { MapRefHandle, MapRegion } from '../../types/map';
import { FlightMapProps } from './types';

const GOOGLE_MAPS_SCRIPT_ID = 'fr24-google-maps-script';
const FLIGHT_ICON_SIZE = 36;

const loadGoogleMaps = (apiKey: string): Promise<any> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps is only available in the browser.'));
  }

  const existing = (window as any).google;
  if (existing?.maps) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve, reject) => {
    const currentScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (currentScript) {
      currentScript.addEventListener('load', () => {
        const googleMaps = (window as any).google;
        if (googleMaps?.maps) {
          resolve(googleMaps);
        } else {
          reject(new Error('Google Maps script loaded but API was not found.'));
        }
      });
      currentScript.addEventListener('error', () => {
        reject(new Error('Google Maps failed to load.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.onload = () => {
      const googleMaps = (window as any).google;
      if (googleMaps?.maps) {
        resolve(googleMaps);
      } else {
        reject(new Error('Google Maps script loaded but API was not found.'));
      }
    };
    script.onerror = () => reject(new Error('Google Maps failed to load.'));
    document.head.appendChild(script);
  });
};

const getRegionFromMap = (map: any): MapRegion | null => {
  const center = map.getCenter?.();
  const bounds = map.getBounds?.();
  if (!center || !bounds) {
    return null;
  }

  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();

  return {
    latitude: center.lat(),
    longitude: center.lng(),
    latitudeDelta: Math.abs(northEast.lat() - southWest.lat()),
    longitudeDelta: Math.abs(northEast.lng() - southWest.lng()),
  };
};

const getBoundsFromRegion = (googleMaps: any, region: MapRegion) => {
  const north = region.latitude + region.latitudeDelta / 2;
  const south = region.latitude - region.latitudeDelta / 2;
  const east = region.longitude + region.longitudeDelta / 2;
  const west = region.longitude - region.longitudeDelta / 2;

  return new googleMaps.maps.LatLngBounds(
    { lat: south, lng: west },
    { lat: north, lng: east }
  );
};

const getZoomFromRegion = (region: MapRegion) => {
  const zoom = Math.log2(360 / region.longitudeDelta);
  return Math.max(2, Math.min(18, Math.round(zoom)));
};

export const FlightMap = forwardRef<MapRefHandle, FlightMapProps>(
  ({ airports, flights, onRegionChangeComplete, onFlightPress, onAirportPress }, ref) => {
    const containerRef = useRef<React.ElementRef<typeof View> | null>(null);
    const mapRef = useRef<any>(null);
    const googleRef = useRef<any>(null);
    const idleListenerRef = useRef<any>(null);
    const airportMarkersRef = useRef<Map<string, any>>(new Map());
    const flightMarkersRef = useRef<Map<string, any>>(new Map());
    const [mapReady, setMapReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [flightIconUrl, setFlightIconUrl] = useState<string | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        animateToRegion: (region) => {
          if (!mapRef.current || !googleRef.current) {
            return;
          }
          const bounds = getBoundsFromRegion(googleRef.current, region);
          mapRef.current.fitBounds(bounds, 32);
        },
      }),
      []
    );

    useEffect(() => {
      let cancelled = false;
      const asset = Asset.fromModule(FLIGHT_MARKER_IMAGE);
      if (asset.uri) {
        setFlightIconUrl(asset.uri);
      }

      asset
        .downloadAsync()
        .then(() => {
          if (!cancelled) {
            setFlightIconUrl(asset.uri);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setFlightIconUrl(asset.uri ?? null);
          }
        });

      return () => {
        cancelled = true;
      };
    }, []);

    useEffect(() => {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
      if (!apiKey) {
        setLoadError('Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.');
        return;
      }

      let cancelled = false;

      loadGoogleMaps(apiKey)
        .then((googleMaps) => {
          if (cancelled) {
            return;
          }
          googleRef.current = googleMaps;

          if (!containerRef.current || mapRef.current) {
            return;
          }

          const element = containerRef.current as unknown as HTMLElement;
          const map = new googleMaps.maps.Map(element, {
            center: { lat: INITIAL_REGION.latitude, lng: INITIAL_REGION.longitude },
            zoom: getZoomFromRegion(INITIAL_REGION),
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            clickableIcons: false,
            backgroundColor: '#0e1217',
          });

          mapRef.current = map;
          setMapReady(true);

          idleListenerRef.current = map.addListener('idle', () => {
            const region = getRegionFromMap(map);
            if (region) {
              onRegionChangeComplete(region);
            }
          });
        })
        .catch((error: Error) => {
          if (!cancelled) {
            setLoadError(error.message);
          }
        });

      return () => {
        cancelled = true;
        idleListenerRef.current?.remove?.();
      };
    }, [onRegionChangeComplete]);

    useEffect(() => {
      if (!mapReady || !mapRef.current || !googleRef.current) {
        return;
      }

      const googleMaps = googleRef.current;
      const map = mapRef.current;
      const markers = airportMarkersRef.current;

      const nextIds = new Set(airports.map((airport) => airport.iata));
      markers.forEach((marker, id) => {
        if (!nextIds.has(id)) {
          marker.setMap(null);
          markers.delete(id);
        }
      });

      airports.forEach((airport) => {
        const position = {
          lat: airport.coordinates.latitude,
          lng: airport.coordinates.longitude,
        };

        let marker = markers.get(airport.iata);
        if (!marker) {
          marker = new googleMaps.maps.Marker({
            map,
            position,
            title: airport.name,
            zIndex: 1,
            icon: {
              path: googleMaps.maps.SymbolPath.CIRCLE,
              scale: 4,
              fillColor: '#ffd166',
              fillOpacity: 1,
              strokeColor: '#1f2a33',
              strokeWeight: 1,
            },
          });
          markers.set(airport.iata, marker);
        } else {
          marker.setPosition(position);
          marker.setTitle(airport.name);
        }

        googleMaps.maps.event.clearListeners(marker, 'click');
        marker.addListener('click', () => onAirportPress(airport));
      });
    }, [airports, mapReady, onAirportPress]);

    useEffect(() => {
      if (!mapReady || !mapRef.current || !googleRef.current) {
        return;
      }

      const googleMaps = googleRef.current;
      const map = mapRef.current;
      const markers = flightMarkersRef.current;

      const nextIds = new Set(flights.map((flight) => flight.fr24_id));
      markers.forEach((marker, id) => {
        if (!nextIds.has(id)) {
          marker.setMap(null);
          markers.delete(id);
        }
      });

      flights.forEach((flight) => {
        const position = { lat: flight.lat, lng: flight.lon };
        const title = flight.flight ?? flight.callsign ?? 'Unknown flight';
        const icon = flightIconUrl
          ? {
              url: flightIconUrl,
              scaledSize: new googleMaps.maps.Size(FLIGHT_ICON_SIZE, FLIGHT_ICON_SIZE),
              anchor: new googleMaps.maps.Point(FLIGHT_ICON_SIZE / 2, FLIGHT_ICON_SIZE / 2),
            }
          : {
              path: googleMaps.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 3,
              rotation: flight.track ?? 0,
              fillColor: '#7ed9ff',
              fillOpacity: 1,
              strokeColor: '#7ed9ff',
              strokeWeight: 1,
            };

        let marker = markers.get(flight.fr24_id);
        if (!marker) {
          marker = new googleMaps.maps.Marker({
            map,
            position,
            title,
            zIndex: 2,
            icon,
          });
          markers.set(flight.fr24_id, marker);
        } else {
          marker.setPosition(position);
          marker.setTitle(title);
          marker.setIcon(icon);
        }

        googleMaps.maps.event.clearListeners(marker, 'click');
        marker.addListener('click', () => onFlightPress(flight));
      });
    }, [flights, mapReady, onFlightPress, flightIconUrl]);

    useEffect(() => {
      return () => {
        airportMarkersRef.current.forEach((marker) => marker.setMap(null));
        flightMarkersRef.current.forEach((marker) => marker.setMap(null));
      };
    }, []);

    return (
      <View style={styles.map}>
        <View ref={containerRef} style={styles.mapCanvas} />
        {!mapReady && !loadError && (
          <View pointerEvents="none" style={styles.overlay}>
            <ActivityIndicator color="#7ed9ff" />
            <Text style={styles.overlayText}>Loading Google Maps…</Text>
          </View>
        )}
        {loadError && (
          <View style={styles.overlay}>
            <Text style={styles.errorTitle}>Map unavailable</Text>
            <Text style={styles.overlayText}>{loadError}</Text>
          </View>
        )}
      </View>
    );
  }
);

FlightMap.displayName = 'FlightMap';

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: '#0e1217',
  },
  mapCanvas: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(14, 18, 23, 0.65)',
  },
  overlayText: {
    color: '#9fb2c1',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#e6f6ff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
