import { useEffect, useState } from 'react';
import { fetchQuotes, fetchTrip } from '@/api/ember';
import { nextDeparture, selectTrips } from '@/utils/selectTrips';
import { hasFinished, journeyStops } from '@/utils/stops';
import type { LiveTrip, TripRef } from '@/types/trip';

export const REFRESH_MS = 15000;

interface State {
  trips: LiveTrip[];
  loading: boolean;
  /** A request failed and there is nothing earlier to keep showing. */
  error: boolean;
  /** The request worked but no trip runs on this route in the next day or so. */
  empty: boolean;
}

const LOADING: State = { trips: [], loading: true, error: false, empty: false };

/** The buses running between two places, refreshed every 15 seconds (see docs/decisions/0001). */
export function useTrips(origin: number, destination: number): State {
  const [state, setState] = useState<State>(LOADING);

  useEffect(() => {
    let cancelled = false;
    setState(LOADING);

    const loadTrips = async (refs: TripRef[]): Promise<LiveTrip[]> => {
      const results = await Promise.allSettled(refs.map((ref) => fetchTrip(ref.uid)));
      return results.flatMap((result, i) =>
        result.status === 'fulfilled'
          ? [
              {
                ...refs[i],
                route: journeyStops(result.value.route, refs[i].originStopId, refs[i].destinationStopId),
                gps: result.value.vehicle?.gps ?? null,
              },
            ]
          : [],
      );
    };

    const load = async () => {
      try {
        const now = new Date();
        const quotes = await fetchQuotes(origin, destination, now);
        const refs = selectTrips(quotes, now);
        const loaded = await loadTrips(refs);
        if (refs.length > 0 && loaded.length === 0) throw new Error('No trip could be loaded');

        // A trip can still be inside its scheduled times after its bus has reached the last stop.
        let trips = loaded.filter((trip) => !(trip.inProgress && hasFinished(trip.route, now)));
        if (trips.length === 0 && refs.length > 0) {
          const next = nextDeparture(quotes, now);
          trips = next ? await loadTrips([next]) : [];
          if (next && trips.length === 0) throw new Error('No trip could be loaded');
        }

        if (cancelled) return;
        setState({ trips, loading: false, error: false, empty: trips.length === 0 });
      } catch (err) {
        console.error('[debug] Failed to fetch trips:', err);
        // Keep showing the last good data when a refresh fails; only report an error if there is none.
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: s.trips.length === 0 }));
      }
    };

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [origin, destination]);

  return state;
}
