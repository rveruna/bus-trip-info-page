export interface Route {
  origin: number;
  destination: number;
}

export const DEFAULT_ORIGIN = 13; // Dundee (City Centre)
export const DEFAULT_DESTINATION = 42; // Edinburgh (City Centre)

const parseId = (value: string | null, fallback: number) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : fallback;
};

/** Reads the route from `?from=13&to=42` so a link opens the same journey. */
export function readRoute(search: string): Route {
  const params = new URLSearchParams(search);
  const origin = parseId(params.get('from'), DEFAULT_ORIGIN);
  const destination = parseId(params.get('to'), DEFAULT_DESTINATION);
  return origin === destination
    ? { origin: DEFAULT_ORIGIN, destination: DEFAULT_DESTINATION }
    : { origin, destination };
}

/** True inside the phone view, which loads this same page in a frame with `?embed=1`. */
export const isEmbedded = (search: string) => new URLSearchParams(search).get('embed') === '1';

export function routeSearch(origin: number, destination: number, embedded = false) {
  return `?from=${origin}&to=${destination}${embedded ? '&embed=1' : ''}`;
}
