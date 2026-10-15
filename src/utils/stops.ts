export interface StopTimes {
  arrival: { scheduled: string; estimated?: string; actual?: string };
  skipped: boolean;
}

/** Index of the first stop the bus has not reached yet, or -1 when it has reached them all. */
export function findNextStopIndex(route: StopTimes[], now: Date): number {
  return route.findIndex((stop) => {
    if (stop.skipped || stop.arrival.actual) return false;
    return new Date(stop.arrival.estimated ?? stop.arrival.scheduled) > now;
  });
}

/** True when the bus has reached every stop on its route. */
export const hasFinished = (route: StopTimes[], now: Date) =>
  route.length > 0 && findNextStopIndex(route, now) === -1;

/** Minutes the bus is running late at its next stop (negative when early), or null with no next stop. */
export function getDelayMinutes(route: StopTimes[], now: Date): number | null {
  const next = route[findNextStopIndex(route, now)];
  if (!next?.arrival.estimated) return next ? 0 : null;
  const late = +new Date(next.arrival.estimated) - +new Date(next.arrival.scheduled);
  return Math.round(late / 60000);
}

export function describeDelay(minutes: number | null): string {
  if (minutes === null) return 'finished';
  if (minutes >= 1) return `${minutes} min late`;
  if (minutes <= -1) return `${-minutes} min early`;
  return 'on time';
}

/**
 * The part of a trip's route between where the journey gets on and off. A through-service from Aberdeen to
 * Edinburgh, followed from Dundee, starts its list at Dundee. Falls back to the whole route when either stop is
 * missing from it.
 */
export function journeyStops<T extends { location: { id: number } }>(
  route: T[],
  originStopId?: number,
  destinationStopId?: number,
): T[] {
  const from = route.findIndex((stop) => stop.location.id === originStopId);
  const to = route.findIndex((stop) => stop.location.id === destinationStopId);
  return from === -1 || to === -1 || to < from ? route : route.slice(from, to + 1);
}
