export const DEFAULT_ORIGIN = 13; // Dundee (City Centre)
export const DEFAULT_DESTINATION = 42; // Edinburgh (City Centre)

const parseId = (value: string | null, fallback: number) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : fallback;
};

/** Reads the route from `?from=13&to=42` so a link opens the same journey. */
export function readRoute(search: string) {
  const params = new URLSearchParams(search);
  const origin = parseId(params.get('from'), DEFAULT_ORIGIN);
  const destination = parseId(params.get('to'), DEFAULT_DESTINATION);
  return origin === destination
    ? { origin: DEFAULT_ORIGIN, destination: DEFAULT_DESTINATION }
    : { origin, destination };
}

export function routeSearch(origin: number, destination: number) {
  return `?from=${origin}&to=${destination}`;
}
