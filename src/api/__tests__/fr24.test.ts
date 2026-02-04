import {
  getLiveFlightPositionsFull,
  getLiveFlightPositionsFullByAirport,
  getAirportFull,
} from '../fr24';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('FR24 API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLiveFlightPositionsFull', () => {
    const validBounds = {
      north: 38.5,
      south: 37.5,
      east: -122.0,
      west: -123.0,
    };

    it('throws error when API key is missing', async () => {
      await expect(
        getLiveFlightPositionsFull('', { bounds: validBounds })
      ).rejects.toThrow('Missing FR24 API key');
    });

    it('constructs correct URL with bounds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await getLiveFlightPositionsFull('test-key', { bounds: validBounds });

      // URL encodes commas as %2C
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('bounds=38.500%2C37.500%2C-123.000%2C-122.000'),
        expect.any(Object)
      );
    });

    it('includes authorization header with bearer token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await getLiveFlightPositionsFull('my-api-key', { bounds: validBounds });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-api-key',
          }),
        })
      );
    });

    it('includes Accept-Version header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await getLiveFlightPositionsFull('test-key', { bounds: validBounds });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept-Version': 'v1',
          }),
        })
      );
    });

    it('passes abort signal to fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const controller = new AbortController();
      await getLiveFlightPositionsFull('test-key', {
        bounds: validBounds,
        signal: controller.signal,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });

    it('includes limit parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await getLiveFlightPositionsFull('test-key', {
        bounds: validBounds,
        limit: 100,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=100'),
        expect.any(Object)
      );
    });

    it('throws error on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(
        getLiveFlightPositionsFull('bad-key', { bounds: validBounds })
      ).rejects.toThrow('FR24 API error 401: Unauthorized');
    });

    it('returns flight data on success', async () => {
      const mockData = {
        data: [
          { fr24_id: 'abc123', flight: 'UA123', lat: 37.5, lon: -122.5 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getLiveFlightPositionsFull('test-key', {
        bounds: validBounds,
      });

      expect(result).toEqual(mockData);
    });
  });

  describe('getLiveFlightPositionsFullByAirport', () => {
    it('throws error when API key is missing', async () => {
      await expect(
        getLiveFlightPositionsFullByAirport('', { airportCode: 'SFO' })
      ).rejects.toThrow('Missing FR24 API key');
    });

    it('constructs correct URL with airport parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await getLiveFlightPositionsFullByAirport('test-key', {
        airportCode: 'SFO',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('airports=SFO'),
        expect.any(Object)
      );
    });

    it('includes authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await getLiveFlightPositionsFullByAirport('my-api-key', {
        airportCode: 'LAX',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-api-key',
          }),
        })
      );
    });

    it('throws error on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Airport not found',
      });

      await expect(
        getLiveFlightPositionsFullByAirport('test-key', { airportCode: 'XXX' })
      ).rejects.toThrow('FR24 API error 404: Airport not found');
    });
  });

  describe('getAirportFull', () => {
    it('throws error when API key is missing', async () => {
      await expect(getAirportFull('', { code: 'SFO' })).rejects.toThrow(
        'Missing FR24 API key'
      );
    });

    it('encodes airport code in URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Test Airport' }),
      });

      await getAirportFull('test-key', { code: 'SFO' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/static/airports/SFO/full'),
        expect.any(Object)
      );
    });

    it('includes authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Test Airport' }),
      });

      await getAirportFull('my-api-key', { code: 'JFK' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-api-key',
          }),
        })
      );
    });

    it('passes abort signal to fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Test Airport' }),
      });

      const controller = new AbortController();
      await getAirportFull('test-key', {
        code: 'SFO',
        signal: controller.signal,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });

    it('throws error on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(
        getAirportFull('test-key', { code: 'SFO' })
      ).rejects.toThrow('FR24 API error 500: Internal Server Error');
    });

    it('returns airport data on success', async () => {
      const mockAirport = {
        name: 'San Francisco International Airport',
        iata: 'SFO',
        icao: 'KSFO',
        lat: 37.6213,
        lon: -122.379,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAirport,
      });

      const result = await getAirportFull('test-key', { code: 'SFO' });

      expect(result).toEqual(mockAirport);
    });
  });
});
