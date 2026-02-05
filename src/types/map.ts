export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapRefHandle = {
  animateToRegion: (region: MapRegion, duration?: number) => void;
};
