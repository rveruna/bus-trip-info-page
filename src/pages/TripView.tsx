import { useEffect, useState } from 'react';
import { useLocations } from '../hooks/useLocations';
import { useTrips } from '../hooks/useTrips';
import { LiveMap } from '../components/LiveMap';
import { RoutePicker } from '../components/RoutePicker';
import { StopList } from '../components/StopList';
import { TripHeader } from '../components/TripHeader';
import { TripSelector } from '../components/TripSelector';
import { isStale } from '../utils/gps';
import type { Route } from '../utils/routeParams';

type Props = {
  route: Route;
  onRouteChange: (update: (route: Route) => Route) => void;
  /** Absent inside the phone view, which does not offer a phone view of itself. */
  onViewOnPhone?: () => void;
};

/** The buses on one route. Leaving this view stops its 15-second refresh. */
export const TripView = ({ route, onRouteChange, onViewOnPhone }: Props) => {
  const [followedUid, setFollowedUid] = useState<string | null>(null);
  const places = useLocations();
  const { trips, loading, error, empty } = useTrips(route.origin, route.destination);

  // The route changed, so the bus that was being followed is no longer on the page.
  useEffect(() => setFollowedUid(null), [route]);

  const nameOf = (id: number) => places.find((place) => place.id === id)?.name ?? `Stop ${id}`;
  // Without a choice, follow a bus that is still reporting its position.
  const selected =
    trips.find((trip) => trip.uid === followedUid) ??
    trips.find((trip) => !isStale(trip.gps, new Date())) ??
    trips[0];

  // Choosing the other end as this end swaps the two, because a route cannot start and end in one place.
  const setOrigin = (origin: number) =>
    onRouteChange((r) => (origin === r.destination ? { origin, destination: r.origin } : { ...r, origin }));
  const setDestination = (destination: number) =>
    onRouteChange((r) =>
      destination === r.origin ? { origin: r.destination, destination } : { ...r, destination },
    );

  return (
    <main>
      <TripHeader
        route={`${nameOf(route.origin)} → ${nameOf(route.destination)}`}
        lastUpdated={selected?.gps?.last_updated}
        action={onViewOnPhone && { label: 'View on a phone', onClick: onViewOnPhone }}
      />

      {places.length > 0 && (
        <RoutePicker
          places={places}
          origin={route.origin}
          destination={route.destination}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onSwap={() => onRouteChange((r) => ({ origin: r.destination, destination: r.origin }))}
        />
      )}

      {loading && (
        <p role="status" style={{ padding: '1rem' }}>
          Loading trips...
        </p>
      )}
      {!loading && error && (
        <p role="alert" style={{ padding: '1rem' }}>
          Something went wrong.
        </p>
      )}
      {!loading && empty && (
        <p role="status" style={{ padding: '1rem' }}>
          No bus is running on this route right now.
        </p>
      )}

      {selected && (
        <>
          {!selected.inProgress && trips.length === 1 && (
            <p role="status" style={{ padding: '1rem' }}>
              No bus is running right now. This is the next departure.
            </p>
          )}

          <section aria-label="Live map" style={{ height: '320px' }}>
            <LiveMap trips={trips} selectedUid={selected.uid} onSelect={setFollowedUid} />
          </section>

          {trips.length > 1 && (
            <TripSelector trips={trips} selectedUid={selected.uid} onSelect={setFollowedUid} />
          )}

          <section style={{ padding: '1rem' }}>
            <StopList route={selected.route} />
          </section>
        </>
      )}
    </main>
  );
};
