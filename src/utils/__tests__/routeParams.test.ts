import { DEFAULT_DESTINATION, DEFAULT_ORIGIN, isEmbedded, readRoute, routeSearch } from '../routeParams';

describe('readRoute', () => {
  it('reads the route from the address', () => {
    expect(readRoute('?from=80&to=452')).toEqual({ origin: 80, destination: 452 });
  });

  it('uses the default route when the address has none', () => {
    expect(readRoute('')).toEqual({ origin: DEFAULT_ORIGIN, destination: DEFAULT_DESTINATION });
  });

  it('falls back for values that are not place ids', () => {
    expect(readRoute('?from=abc&to=-4')).toEqual({
      origin: DEFAULT_ORIGIN,
      destination: DEFAULT_DESTINATION,
    });
  });

  it('refuses a route that starts and ends in the same place', () => {
    expect(readRoute('?from=7&to=7')).toEqual({ origin: DEFAULT_ORIGIN, destination: DEFAULT_DESTINATION });
  });

  it('round-trips through routeSearch', () => {
    expect(readRoute(routeSearch(80, 452))).toEqual({ origin: 80, destination: 452 });
  });
});

describe('embedding', () => {
  it('knows when the page is inside the phone view', () => {
    expect(isEmbedded('?from=1&to=2&embed=1')).toBe(true);
    expect(isEmbedded('?from=1&to=2')).toBe(false);
    expect(isEmbedded('?embed=0')).toBe(false);
  });

  it('adds embed to the address only when asked', () => {
    expect(routeSearch(13, 42)).toBe('?from=13&to=42');
    expect(routeSearch(13, 42, true)).toBe('?from=13&to=42&embed=1');
  });
});
