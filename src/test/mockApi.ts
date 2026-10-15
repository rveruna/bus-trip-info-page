import type { LocationTime, Place, Quote } from '@/types/trip';

const minutes = (offset: number) => new Date(Date.now() + offset * 60000).toISOString();

/** A quote for a trip that departs `departsIn` minutes from now (negative: already left) and takes `duration`. */
export const makeQuote = (uid: string, departsIn: number, duration = 120): Quote => ({
  legs: [
    {
      trip_uid: uid,
      departure: { scheduled: minutes(departsIn) },
      arrival: { scheduled: minutes(departsIn + duration) },
    },
  ],
});

export const makeStop = (
  id: number,
  name: string,
  arrivesIn: number,
  extra: Partial<LocationTime['arrival']> = {},
) =>
  ({
    id,
    location: { id, name, lat: 56 + id / 10, lon: -3 },
    arrival: { scheduled: minutes(arrivesIn), ...extra },
    departure: { scheduled: minutes(arrivesIn) },
    skipped: false,
  }) as LocationTime;

/** A trip whose bus last reported `seenMinutesAgo` minutes ago (default: just now). */
export const makeTrip = (
  stops: LocationTime[],
  gps?: { latitude: number; longitude: number; heading?: number },
  seenMinutesAgo = 0,
) => ({
  route: stops,
  vehicle: gps ? { gps: { ...gps, last_updated: minutes(-seenMinutesAgo) } } : undefined,
});

export const makePlace = (id: number, name: string, has_future_activity = true): Place => ({
  id,
  name,
  has_future_activity,
});

interface Responses {
  places?: Place[];
  quotes?: Quote[];
  trips?: Record<string, ReturnType<typeof makeTrip>>;
  /** Trip ids whose request fails. */
  failTrips?: string[];
  failQuotes?: boolean;
}

/** Replaces fetch with a fake of the three Ember endpoints the page uses. */
export function mockApi({
  places = [],
  quotes = [],
  trips = {},
  failTrips = [],
  failQuotes = false,
}: Responses) {
  const respond = (ok: boolean, body: unknown) => Promise.resolve({ ok, json: async () => body } as Response);

  const fake = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/locations/')) return respond(true, places);
    if (url.includes('/quotes/')) return respond(!failQuotes, { quotes });
    const uid = url.split('/trips/')[1]?.replace('/', '');
    if (uid && trips[uid] && !failTrips.includes(uid)) return respond(true, trips[uid]);
    return respond(false, {});
  });

  global.fetch = fake as unknown as typeof fetch;
  return fake;
}
