import { MapRegion } from '../types/map';

export const INITIAL_REGION: MapRegion = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export const FLIGHT_MARKER_IMAGE = require('../../assets/a380.png');

export const FLIGHT_REFRESH_INTERVAL = 10000; // 10 seconds
