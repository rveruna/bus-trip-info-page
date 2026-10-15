import { useEffect, useState } from 'react';
import { useLocations } from '../hooks/useLocations';
import { useTrips } from '../hooks/useTrips';
import { LiveMap } from '../components/LiveMap';
import { RoutePicker } from '../components/RoutePicker';
import { StopList } from '../components/StopList';
import { TripHeader } from '../components/TripHeader';
import { TripSelector } from '../components/TripSelector';
import { readRoute, routeSearch } from '../utils/routeParams';

export const TripPage = () => {
  const [route, setRoute] = useState(() => readRoute(window.location.search));
  const [followedUid, setFollowedUid] = useState<string | null>(null);
  const places = useLocations();
  const { trips, loading, error, empty } = useTrips(route.origin, route.destination);

  // Keep the address in step with the route so the page can be shared.
  useEffect(() => {
    window.history.replaceState(null, '', routeSearch(route.origin, route.destination));
  }, [route]);

  // The route changed, so the bus that was being followed is no longer on the page.
  useEffect(() => setFollowedUid(null), [route]);

  const nameOf = (id: number) => places.find((place) => place.id === id)?.name ?? `Stop ${id}`;
  const selected = trips.find((trip) => trip.uid === followedUid) ?? trips[0];

  // Choosing the other end as this end swaps the two, because a route cannot start and end in one place.
  const setOrigin = (origin: number) =>
    setRoute((r) => (origin === r.destination ? { origin, destination: r.origin } : { ...r, origin }));
  const setDestination = (destination: number) =>
    setRoute((r) =>
      destination === r.origin ? { origin: r.destination, destination } : { ...r, destination },
    );

  return (
    <main>
      <TripHeader
        route={`${nameOf(route.origin)} → ${nameOf(route.destination)}`}
        lastUpdated={selected?.gps?.last_updated}
      />

      {places.length > 0 && (
        <RoutePicker
          places={places}
          origin={route.origin}
          destination={route.destination}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onSwap={() => setRoute((r) => ({ origin: r.destination, destination: r.origin }))}
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
          No buses run on this route today or tomorrow.
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
