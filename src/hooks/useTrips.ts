import { useEffect, useState } from 'react';
import { fetchQuotes, fetchTrip } from '@/api/ember';
import { selectTrips } from '@/utils/selectTrips';
import type { LiveTrip } from '@/types/trip';

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

    const load = async () => {
      try {
        const now = new Date();
        const refs = selectTrips(await fetchQuotes(origin, destination, now), now);

        const results = await Promise.allSettled(refs.map((ref) => fetchTrip(ref.uid)));
        const trips = results.flatMap((result, i) =>
          result.status === 'fulfilled'
            ? [{ ...refs[i], route: result.value.route, gps: result.value.vehicle?.gps ?? null }]
            : [],
        );

        if (cancelled) return;
        if (refs.length === 0) {
          setState({ trips: [], loading: false, error: false, empty: true });
        } else if (trips.length === 0) {
          throw new Error('No trip could be loaded');
        } else {
          setState({ trips, loading: false, error: false, empty: false });
        }
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
