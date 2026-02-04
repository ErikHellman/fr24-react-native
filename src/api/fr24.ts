const FR24_BASE_URL = 'https://fr24api.flightradar24.com';

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type FlightPositionFull = {
  fr24_id: string;
  flight: string | null;
  callsign: string | null;
  lat: number;
  lon: number;
  track: number;
  alt: number;
  gspeed: number;
  vspeed: number;
  squawk: string;
  timestamp: string;
  source: string;
  hex: string | null;
  type: string | null;
  reg: string | null;
  painted_as: string | null;
  operating_as: string | null;
  orig_iata: string | null;
  orig_icao: string | null;
  dest_iata: string | null;
  dest_icao: string | null;
  eta: string | null;
};

export type Country = {
  code: string;
  name: string;
};

export type Timezone = {
  name: string;
  offset: number;
};

export type RunwaySurface = {
  type: string;
  description: string;
};

export type Runway = {
  designator: string;
  heading: number;
  length: number;
  width: number;
  elevation: number;
  thr_coordinates: [number, number];
  surface: RunwaySurface;
};

export type AirportFull = {
  name: string;
  iata: string | null;
  icao: string | null;
  lon: number;
  lat: number;
  elevation: number;
  country: Country;
  city: string;
  state: string | null;
  timezone: Timezone;
  runways: Runway[];
};

export type LiveFlightPositionsFullResponse = {
  data: FlightPositionFull[];
};

export type LiveFlightPositionsFullParams = {
  bounds: MapBounds;
  limit?: number;
  signal?: AbortSignal;
};

export type LiveFlightPositionsFullAirportParams = {
  airportCode: string;
  limit?: number;
  signal?: AbortSignal;
};

export type AirportFullParams = {
  code: string;
  signal?: AbortSignal;
};

const formatBounds = (bounds: MapBounds) => {
  const north = bounds.north.toFixed(3);
  const south = bounds.south.toFixed(3);
  const west = bounds.west.toFixed(3);
  const east = bounds.east.toFixed(3);
  return `${north},${south},${west},${east}`;
};

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }
  return query.toString();
};

export const getLiveFlightPositionsFull = async (
  apiKey: string,
  { bounds, limit, signal }: LiveFlightPositionsFullParams,
): Promise<LiveFlightPositionsFullResponse> => {
  if (!apiKey) {
    throw new Error('Missing FR24 API key. Set FR24_API_KEY in your environment.');
  }

  const query = buildQuery({
    bounds: formatBounds(bounds),
    limit,
  });
  const url = `${FR24_BASE_URL}/api/live/flight-positions/full?${query}`;
  console.log('FR24 API Request URL:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Version': 'v1',
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`FR24 API error ${response.status}: ${body}`);
  }

  return (await response.json()) as LiveFlightPositionsFullResponse;
};

export const getLiveFlightPositionsFullByAirport = async (
  apiKey: string,
  { airportCode, limit, signal }: LiveFlightPositionsFullAirportParams,
): Promise<LiveFlightPositionsFullResponse> => {
  if (!apiKey) {
    throw new Error('Missing FR24 API key. Set FR24_API_KEY in your environment.');
  }

  const query = buildQuery({
    airports: airportCode,
    limit,
  });
  const url = `${FR24_BASE_URL}/api/live/flight-positions/full?${query}`;
  console.log('FR24 API Request URL:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Version': 'v1',
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`FR24 API error ${response.status}: ${body}`);
  }

  return (await response.json()) as LiveFlightPositionsFullResponse;
};

export const getAirportFull = async (
  apiKey: string,
  { code, signal }: AirportFullParams,
): Promise<AirportFull> => {
  if (!apiKey) {
    throw new Error('Missing FR24 API key. Set FR24_API_KEY in your environment.');
  }

  const url = `${FR24_BASE_URL}/api/static/airports/${encodeURIComponent(code)}/full`;
  console.log('FR24 API Request URL:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Version': 'v1',
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`FR24 API error ${response.status}: ${body}`);
  }

  return (await response.json()) as AirportFull;
};
