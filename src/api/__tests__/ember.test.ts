import { fetchQuotes, fetchTrip } from '../ember';

const respond = (ok: boolean, body: unknown) => Promise.resolve({ ok, json: async () => body } as Response);

describe('Ember API', () => {
  afterEach(() => jest.restoreAllMocks());

  it('asks for quotes from the start of today to the end of tomorrow, in UTC', async () => {
    const fetchMock = jest.fn(() => respond(true, { quotes: [] }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetchQuotes(13, 42, new Date('2026-10-15T09:21:00Z'));

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.ember.to/v1/quotes/?origin=13&destination=42&departure_date_from=2026-10-15T00:00:00Z&departure_date_to=2026-10-16T23:59:59Z',
    );
  });

  it('rejects a quotes response that is not a list', async () => {
    global.fetch = jest.fn(() => respond(true, { quotes: null })) as unknown as typeof fetch;

    await expect(fetchQuotes(13, 42, new Date())).rejects.toThrow('Quotes is not an array');
  });

  it('rejects a failed request', async () => {
    global.fetch = jest.fn(() => respond(false, {})) as unknown as typeof fetch;

    await expect(fetchTrip('abc')).rejects.toThrow('Request failed: /trips/abc/');
  });
});
