export type AirportEntry = {
  name: string;
  iata: string;
  icao: string;
  city: string;
  country: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
};
