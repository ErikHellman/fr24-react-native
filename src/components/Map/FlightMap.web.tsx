import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { FLIGHT_MARKER_IMAGE, INITIAL_REGION } from '../../constants/map';
import { MapRefHandle, MapRegion } from '../../types/map';
import { FlightMapProps } from './types';

const GOOGLE_MAPS_SCRIPT_ID = 'fr24-google-maps-script';
const GOOGLE_MAPS_CALLBACK = 'fr24InitGoogleMaps';
const FLIGHT_ICON_SIZE = 36;
let googleMapsPromise: Promise<any> | null = null;

type AirportMarkerHandle = {
  marker: any;
};

type FlightMarkerHandle = {
  marker: any;
  container: HTMLDivElement;
  img?: HTMLImageElement;
  arrow?: HTMLDivElement;
};

const replaceChildren = (container: HTMLElement, child: HTMLElement) => {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  container.appendChild(child);
};

const createAirportMarkerContent = () => {
  const dot = document.createElement('div');
  dot.style.width = '10px';
  dot.style.height = '10px';
  dot.style.borderRadius = '50%';
  dot.style.backgroundColor = '#ffd166';
  dot.style.border = '1px solid #1f2a33';
  dot.style.boxSizing = 'border-box';
  return dot;
};

const createFlightMarkerContainer = () => {
  const container = document.createElement('div');
  container.style.width = `${FLIGHT_ICON_SIZE}px`;
  container.style.height = `${FLIGHT_ICON_SIZE}px`;
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.transformOrigin = '50% 50%';
  return container;
};

const createFlightArrow = () => {
  const arrow = document.createElement('div');
  arrow.style.width = '0';
  arrow.style.height = '0';
  arrow.style.borderLeft = '6px solid transparent';
  arrow.style.borderRight = '6px solid transparent';
  arrow.style.borderBottom = '12px solid #7ed9ff';
  return arrow;
};

const createFlightImage = (iconUrl: string) => {
  const img = document.createElement('img');
  img.src = iconUrl;
  img.alt = '';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.display = 'block';
  return img;
};

const updateFlightMarkerContent = (
  handle: FlightMarkerHandle,
  iconUrl: string | null,
  rotation: number
) => {
  handle.container.style.transform = `rotate(${rotation}deg)`;

  if (iconUrl) {
    if (!handle.img || handle.img.src !== iconUrl) {
      const img = createFlightImage(iconUrl);
      replaceChildren(handle.container, img);
      handle.img = img;
      handle.arrow = undefined;
    }
    return;
  }

  if (!handle.arrow) {
    const arrow = createFlightArrow();
    replaceChildren(handle.container, arrow);
    handle.arrow = arrow;
    handle.img = undefined;
  }
};

const loadGoogleMaps = (apiKey: string): Promise<any> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps is only available in the browser.'));
  }

  const existing = (window as any).google;
  if (existing?.maps?.Map) {
    return Promise.resolve(existing);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const resolveIfReady = () => {
      const googleMaps = (window as any).google;
      if (googleMaps?.maps?.Map) {
        resolve(googleMaps);
        return true;
      }
      return false;
    };

    (window as any)[GOOGLE_MAPS_CALLBACK] = () => {
      if (!resolveIfReady()) {
        reject(new Error('Google Maps callback fired but API was not found.'));
      }
      try {
        delete (window as any)[GOOGLE_MAPS_CALLBACK];
      } catch {
        // Ignore cleanup failures (non-configurable properties).
      }
    };

    const currentScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (currentScript) {
      if (!currentScript.src.includes(`callback=${GOOGLE_MAPS_CALLBACK}`)) {
        currentScript.addEventListener('load', () => {
          if (resolveIfReady()) {
            return;
          }
          const start = Date.now();
          const interval = window.setInterval(() => {
            if (resolveIfReady()) {
              window.clearInterval(interval);
            } else if (Date.now() - start > 5000) {
              window.clearInterval(interval);
              reject(new Error('Google Maps failed to initialize.'));
            }
          }, 50);
        });
      }
      currentScript.addEventListener('error', () => {
        reject(new Error('Google Maps failed to load.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async&callback=${GOOGLE_MAPS_CALLBACK}&libraries=marker`;
    script.onerror = () => reject(new Error('Google Maps failed to load.'));
    document.head.appendChild(script);
  });

  googleMapsPromise.catch(() => {
    googleMapsPromise = null;
  });

  return googleMapsPromise;
};

const loadMarkerLibrary = (googleMaps: any): Promise<any> => {
  if (googleMaps?.maps?.marker?.AdvancedMarkerElement) {
    return Promise.resolve(googleMaps.maps.marker);
  }

  if (googleMaps?.maps?.importLibrary) {
    return googleMaps.maps.importLibrary('marker');
  }

  return Promise.reject(new Error('Advanced marker library is not available.'));
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
    const markerLibraryRef = useRef<any>(null);
    const markerLibraryPromiseRef = useRef<Promise<any> | null>(null);
    const idleListenerRef = useRef<any>(null);
    const airportMarkersRef = useRef<Map<string, AirportMarkerHandle>>(new Map());
    const flightMarkersRef = useRef<Map<string, FlightMarkerHandle>>(new Map());
    const [mapReady, setMapReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [flightIconUrl, setFlightIconUrl] = useState<string | null>(null);

    const getMarkerLibrary = (googleMaps: any) => {
      if (markerLibraryRef.current) {
        return Promise.resolve(markerLibraryRef.current);
      }
      if (markerLibraryPromiseRef.current) {
        return markerLibraryPromiseRef.current;
      }
      markerLibraryPromiseRef.current = loadMarkerLibrary(googleMaps).then((library) => {
        markerLibraryRef.current = library;
        return library;
      });
      return markerLibraryPromiseRef.current;
    };

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
      const mapId = process.env.EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID ?? '';
      if (!apiKey) {
        setLoadError('Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.');
        return;
      }
      if (!mapId) {
        setLoadError('Missing EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID.');
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
            mapId,
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

      let cancelled = false;
      const googleMaps = googleRef.current;
      const map = mapRef.current;
      const markers = airportMarkersRef.current;

      getMarkerLibrary(googleMaps)
        .then((markerLibrary) => {
          if (cancelled) {
            return;
          }

          const { AdvancedMarkerElement } = markerLibrary;
          const nextIds = new Set(airports.map((airport) => airport.iata));

          markers.forEach((handle, id) => {
            if (!nextIds.has(id)) {
              handle.marker.map = null;
              markers.delete(id);
            }
          });

          airports.forEach((airport) => {
            const position = {
              lat: airport.coordinates.latitude,
              lng: airport.coordinates.longitude,
            };

            let handle = markers.get(airport.iata);
            if (!handle) {
              const content = createAirportMarkerContent();
              const marker = new AdvancedMarkerElement({
                map,
                position,
                title: airport.name,
                zIndex: 1,
                content,
                gmpClickable: true,
              });
              handle = { marker };
              markers.set(airport.iata, handle);
            } else {
              handle.marker.position = position;
              handle.marker.title = airport.name;
              handle.marker.zIndex = 1;
            }

            googleMaps.maps.event.clearListeners(handle.marker, 'gmp-click');
            handle.marker.addListener('gmp-click', () => onAirportPress(airport));
          });
        })
        .catch((error: Error) => {
          if (!cancelled) {
            console.warn('Advanced markers failed to load for airports.', error);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [airports, mapReady, onAirportPress]);

    useEffect(() => {
      if (!mapReady || !mapRef.current || !googleRef.current) {
        return;
      }

      let cancelled = false;
      const googleMaps = googleRef.current;
      const map = mapRef.current;
      const markers = flightMarkersRef.current;

      getMarkerLibrary(googleMaps)
        .then((markerLibrary) => {
          if (cancelled) {
            return;
          }

          const { AdvancedMarkerElement } = markerLibrary;
          const nextIds = new Set(flights.map((flight) => flight.fr24_id));

          markers.forEach((handle, id) => {
            if (!nextIds.has(id)) {
              handle.marker.map = null;
              markers.delete(id);
            }
          });

          flights.forEach((flight) => {
            const position = { lat: flight.lat, lng: flight.lon };
            const title = flight.flight ?? flight.callsign ?? 'Unknown flight';
            const rotation = flight.track ?? 0;

            let handle = markers.get(flight.fr24_id);
            if (!handle) {
              const container = createFlightMarkerContainer();
              const marker = new AdvancedMarkerElement({
                map,
                position,
                title,
                zIndex: 2,
                content: container,
                gmpClickable: true,
              });
              handle = { marker, container };
              markers.set(flight.fr24_id, handle);
            } else {
              handle.marker.position = position;
              handle.marker.title = title;
              handle.marker.zIndex = 2;
            }

            updateFlightMarkerContent(handle, flightIconUrl, rotation);
            googleMaps.maps.event.clearListeners(handle.marker, 'gmp-click');
            handle.marker.addListener('gmp-click', () => onFlightPress(flight));
          });
        })
        .catch((error: Error) => {
          if (!cancelled) {
            console.warn('Advanced markers failed to load for flights.', error);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [flights, mapReady, onFlightPress, flightIconUrl]);

    useEffect(() => {
      return () => {
        airportMarkersRef.current.forEach((handle) => {
          handle.marker.map = null;
        });
        flightMarkersRef.current.forEach((handle) => {
          handle.marker.map = null;
        });
      };
    }, []);

    return (
      <View style={styles.map}>
        <View ref={containerRef} style={styles.mapCanvas} />
        {!mapReady && !loadError && (
          <View style={[styles.overlay, styles.overlayPassive]}>
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
  overlayPassive: {
    pointerEvents: 'none',
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
