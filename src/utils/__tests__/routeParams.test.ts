import { DEFAULT_DESTINATION, DEFAULT_ORIGIN, readRoute, routeSearch } from '../routeParams';

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
