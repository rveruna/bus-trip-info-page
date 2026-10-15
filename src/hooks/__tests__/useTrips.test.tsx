import { act, renderHook, waitFor } from '@testing-library/react';
import { REFRESH_MS, useTrips } from '../useTrips';
import { makeQuote, makeStop, makeTrip, mockApi } from '../../test/mockApi';

const gps = { latitude: 56.1, longitude: -3.1, heading: 90 };
const trip = (name: string) => makeTrip([makeStop(1, name, 30)], gps);

describe('useTrips', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('loads every trip that is running, each with its bus position', async () => {
    mockApi({
      quotes: [makeQuote('a', -60), makeQuote('b', -30)],
      trips: { a: trip('Stop A'), b: trip('Stop B') },
    });

    const { result } = renderHook(() => useTrips(13, 42));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(false);
    expect(result.current.trips.map((t) => t.uid)).toEqual(['a', 'b']);
    expect(result.current.trips[0].gps).toMatchObject(gps);
    expect(result.current.trips[0].route[0].location.name).toBe('Stop A');
  });

  test('follows a running bus, not one that has not left yet', async () => {
    const fetchMock = mockApi({
      quotes: [makeQuote('not-left', 20), makeQuote('running', -30)],
      trips: { 'not-left': trip('Depot'), running: trip('On the road') },
    });

    const { result } = renderHook(() => useTrips(13, 42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.trips.map((t) => t.uid)).toEqual(['running']);
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/trips/not-left/'));
  });

  test('falls back to the next departure when no bus is running', async () => {
    mockApi({ quotes: [makeQuote('soon', 20)], trips: { soon: trip('Stop A') } });

    const { result } = renderHook(() => useTrips(13, 42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.trips).toHaveLength(1);
    expect(result.current.trips[0].inProgress).toBe(false);
  });

  test('reports an empty route when nothing runs', async () => {
    mockApi({ quotes: [] });

    const { result } = renderHook(() => useTrips(13, 42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current).toMatchObject({ empty: true, error: false, trips: [] });
  });

  test('has no bus position when the vehicle reports no gps', async () => {
    mockApi({ quotes: [makeQuote('a', -30)], trips: { a: makeTrip([makeStop(1, 'Stop A', 30)]) } });

    const { result } = renderHook(() => useTrips(13, 42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.trips[0].gps).toBeNull();
  });

  test('still shows the other buses when one trip fails to load', async () => {
    mockApi({
      quotes: [makeQuote('a', -60), makeQuote('b', -30)],
      trips: { a: trip('Stop A'), b: trip('Stop B') },
      failTrips: ['a'],
    });

    const { result } = renderHook(() => useTrips(13, 42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(false);
    expect(result.current.trips.map((t) => t.uid)).toEqual(['b']);
  });

  test('reports an error when the quotes request fails', async () => {
    mockApi({ failQuotes: true });

    const { result } = renderHook(() => useTrips(13, 42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current).toMatchObject({ error: true, empty: false, trips: [] });
  });

  test('reports an error when every trip fails to load', async () => {
    mockApi({ quotes: [makeQuote('a', -30)], trips: { a: trip('Stop A') }, failTrips: ['a'] });

    const { result } = renderHook(() => useTrips(13, 42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
  });

  test('moves the bus when a refresh brings a new position', async () => {
    jest.useFakeTimers();
    const quotes = [makeQuote('a', -30)];
    mockApi({ quotes, trips: { a: makeTrip([makeStop(1, 'Stop A', 30)], gps) } });

    const { result } = renderHook(() => useTrips(13, 42));
    await act(() => jest.advanceTimersByTimeAsync(0));
    expect(result.current.trips[0].gps?.latitude).toBe(56.1);

    mockApi({ quotes, trips: { a: makeTrip([makeStop(1, 'Stop A', 30)], { ...gps, latitude: 56.2 }) } });
    await act(() => jest.advanceTimersByTimeAsync(REFRESH_MS));

    expect(result.current.trips[0].gps?.latitude).toBe(56.2);
  });

  test('keeps the last good data when a refresh fails', async () => {
    jest.useFakeTimers();
    mockApi({ quotes: [makeQuote('a', -30)], trips: { a: trip('Stop A') } });

    const { result } = renderHook(() => useTrips(13, 42));
    await act(() => jest.advanceTimersByTimeAsync(0));
    expect(result.current.trips).toHaveLength(1);

    const failing = mockApi({ failQuotes: true });
    await act(() => jest.advanceTimersByTimeAsync(REFRESH_MS));

    expect(failing).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe(false);
    expect(result.current.trips).toHaveLength(1);
  });

  test('drops the old buses once a refresh finds that none are left', async () => {
    jest.useFakeTimers();
    mockApi({ quotes: [makeQuote('a', -30)], trips: { a: trip('Stop A') } });

    const { result } = renderHook(() => useTrips(13, 42));
    await act(() => jest.advanceTimersByTimeAsync(0));

    mockApi({ quotes: [] });
    await act(() => jest.advanceTimersByTimeAsync(REFRESH_MS));

    expect(result.current).toMatchObject({ empty: true, trips: [] });
  });

  test('stops refreshing once the page is left', async () => {
    jest.useFakeTimers();
    const fetchMock = mockApi({ quotes: [makeQuote('a', -30)], trips: { a: trip('Stop A') } });

    const { unmount } = renderHook(() => useTrips(13, 42));
    await act(() => jest.advanceTimersByTimeAsync(0));
    const calls = fetchMock.mock.calls.length;

    unmount();
    await act(() => jest.advanceTimersByTimeAsync(REFRESH_MS * 3));

    expect(fetchMock).toHaveBeenCalledTimes(calls);
  });

  test('loads the new route when the route changes', async () => {
    const fetchMock = mockApi({ quotes: [makeQuote('a', -30)], trips: { a: trip('Stop A') } });

    const { result, rerender } = renderHook(({ from, to }) => useTrips(from, to), {
      initialProps: { from: 13, to: 42 },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ from: 80, to: 452 });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    const quoteUrls = fetchMock.mock.calls
      .map(([url]) => String(url))
      .filter((url) => url.includes('/quotes/'));
    expect(quoteUrls.at(-1)).toContain('origin=80&destination=452');
  });

  test('ignores a slow answer for a route the user has already left', async () => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));

    mockApi({
      quotes: [makeQuote('new', -30)],
      trips: { old: trip('Old route'), new: trip('New route') },
    });
    const answer = global.fetch;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (!String(input).includes('origin=13')) return answer(input);
      await held; // the first route's quotes arrive only after the user has switched
      return { ok: true, json: async () => ({ quotes: [makeQuote('old', -30)] }) } as Response;
    }) as unknown as typeof fetch;

    const { result, rerender } = renderHook(({ from, to }) => useTrips(from, to), {
      initialProps: { from: 13, to: 42 },
    });
    rerender({ from: 80, to: 452 });
    await waitFor(() => expect(result.current.trips.map((t) => t.uid)).toEqual(['new']));

    await act(async () => {
      release();
      await held;
    });

    expect(result.current.trips.map((t) => t.uid)).toEqual(['new']);
  });

  describe('a bus that has already finished its trip', () => {
    const past = (name: string, id = 1) =>
      makeTrip([makeStop(id, name, -30, { actual: new Date().toISOString() })], gps);

    test('is not shown as running, even inside its scheduled times', async () => {
      mockApi({
        quotes: [makeQuote('done', -60), makeQuote('running', -30)],
        trips: { done: past('Last stop'), running: trip('Still going') },
      });

      const { result } = renderHook(() => useTrips(13, 42));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.trips.map((t) => t.uid)).toEqual(['running']);
    });

    test('is replaced by the next departure when it was the only bus', async () => {
      mockApi({
        quotes: [makeQuote('done', -60), makeQuote('soon', 20)],
        trips: { done: past('Last stop'), soon: trip('Depot') },
      });

      const { result } = renderHook(() => useTrips(13, 42));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.trips.map((t) => [t.uid, t.inProgress])).toEqual([['soon', false]]);
      expect(result.current.empty).toBe(false);
    });

    test('leaves the page empty when there is no next departure either', async () => {
      mockApi({ quotes: [makeQuote('done', -60)], trips: { done: past('Last stop') } });

      const { result } = renderHook(() => useTrips(13, 42));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current).toMatchObject({ trips: [], empty: true, error: false });
    });

    test('reports an error, not an empty route, when the next departure cannot be loaded', async () => {
      mockApi({
        quotes: [makeQuote('done', -60), makeQuote('soon', 20)],
        trips: { done: past('Last stop'), soon: trip('Depot') },
        failTrips: ['soon'],
      });

      const { result } = renderHook(() => useTrips(13, 42));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current).toMatchObject({ error: true, empty: false });
    });
  });

  test('keeps only the stops of the chosen journey on a trip that runs further', async () => {
    const through = makeTrip(
      [
        makeStop(1, 'Aberdeen', -90, { actual: new Date().toISOString() }),
        makeStop(2, 'Dundee', -10),
        makeStop(3, 'Perth', 20),
        makeStop(4, 'Edinburgh', 80),
      ],
      gps,
    );
    mockApi({ quotes: [makeQuote('through', -10, 90, { from: 2, to: 4 })], trips: { through } });

    const { result } = renderHook(() => useTrips(13, 42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.trips[0].route.map((stop) => stop.location.name)).toEqual([
      'Dundee',
      'Perth',
      'Edinburgh',
    ]);
  });

  test('counts a bus as finished once it reaches the journey’s last stop, even if its trip goes on', async () => {
    const past = { actual: new Date().toISOString() };
    const through = makeTrip(
      [makeStop(1, 'Dundee', -60, past), makeStop(2, 'Edinburgh', -5, past), makeStop(3, 'Glasgow', 60)],
      gps,
    );
    mockApi({ quotes: [makeQuote('through', -60, 70, { from: 1, to: 2 })], trips: { through } });

    const { result } = renderHook(() => useTrips(13, 42));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current).toMatchObject({ trips: [], empty: true });
  });
});
