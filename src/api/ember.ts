import type { Place, Quote, LocationTime, Vehicle } from '@/types/trip';

const BASE_URL = 'https://api.ember.to/v1';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json() as Promise<T>;
}

export const fetchLocations = () => getJson<Place[]>('/locations/');

/**
 * Quotes for today and tomorrow (UTC). The API refuses searches that start on a previous day, so a trip that
 * left yesterday and is still running overnight cannot be found.
 */
export async function fetchQuotes(origin: number, destination: number, now: Date): Promise<Quote[]> {
  const from = `${now.toISOString().split('T')[0]}T00:00:00Z`;
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const to = `${tomorrow.toISOString().split('T')[0]}T23:59:59Z`;
  const { quotes } = await getJson<{ quotes: unknown }>(
    `/quotes/?origin=${origin}&destination=${destination}&departure_date_from=${from}&departure_date_to=${to}`,
  );
  if (!Array.isArray(quotes)) throw new Error('Quotes is not an array');
  return quotes;
}

export const fetchTrip = (uid: string) =>
  getJson<{ route: LocationTime[]; vehicle?: Vehicle }>(`/trips/${uid}/`);
