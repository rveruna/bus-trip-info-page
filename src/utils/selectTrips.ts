import type { Quote, TripRef } from '@/types/trip';

export const MAX_BUSES = 6;

const isValid = (date: Date) => !Number.isNaN(+date);

/**
 * Picks the trips worth showing from a list of quotes: every trip that has left and not yet arrived, earliest
 * first. When nothing is running it falls back to the next departure, so the page still has something to show.
 */
export function selectTrips(quotes: Quote[], now: Date, max = MAX_BUSES): TripRef[] {
  const seen = new Set<string>();
  const refs: TripRef[] = [];

  for (const quote of quotes) {
    const leg = quote.legs?.[0];
    const departure = leg?.departure?.scheduled;
    const arrival = leg?.arrival?.scheduled;
    if (!leg?.trip_uid || !departure || !arrival || seen.has(leg.trip_uid)) continue;
    if (!isValid(new Date(departure)) || !isValid(new Date(arrival))) continue;

    seen.add(leg.trip_uid);
    refs.push({
      uid: leg.trip_uid,
      departure,
      arrival,
      inProgress: new Date(departure) <= now && now <= new Date(arrival),
    });
  }

  const byDeparture = (a: TripRef, b: TripRef) => +new Date(a.departure) - +new Date(b.departure);

  const running = refs.filter((ref) => ref.inProgress).sort(byDeparture);
  if (running.length > 0) return running.slice(0, max);

  const next = refs.filter((ref) => new Date(ref.departure) > now).sort(byDeparture)[0];
  return next ? [next] : [];
}
