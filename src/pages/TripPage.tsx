import { useTripData } from '../hooks/useTripData';
import { StopList } from '../components/StopList';
import { TripHeader } from '../components/TripHeader';
import { LiveMap } from '../components/LiveMap';

export const TripPage = () => {
  const { trip, gps, loading, error } = useTripData();

  if (loading) {
    return (
      <main>
        <p role="status">Loading trip...</p>
      </main>
    );
  }
  if (error || !trip) {
    return (
      <main>
        <p role="alert">Something went wrong.</p>
      </main>
    );
  }

  return (
    <main>
      <TripHeader lastUpdated={gps?.last_updated} />

      <section style={{ height: '240px' }}>
        <LiveMap gps={gps} route={trip.route} />
      </section>

      <section style={{ padding: '1rem' }}>
        <StopList route={trip.route} />
      </section>
    </main>
  );
};
