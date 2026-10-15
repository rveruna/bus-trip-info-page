import type { Vehicle } from '@/types/trip';

/** A position older than this is not shown: the bus has stopped reporting, so the dot would be a guess. */
export const STALE_AFTER_MS = 10 * 60 * 1000;

/** True when a bus has no position, or its last position is too old (or unreadable) to trust. */
export function isStale(gps: Vehicle['gps'] | null, now: Date): boolean {
  if (!gps) return true;
  const age = +now - +new Date(gps.last_updated);
  return !(age <= STALE_AFTER_MS); // an unreadable time gives NaN, which counts as stale
}
