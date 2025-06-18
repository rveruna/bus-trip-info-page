import { useTripData } from "../hooks/useTripData";
import { StopList } from "../components/StopList";
import { TripHeader } from "../components/TripHeader";
import { LiveMap } from "../components/LiveMap";

export const TripPage = () => {
  const { trip, gps, loading, error } = useTripData();

  if (loading) return <p>Loading trip...</p>;
  if (error || !trip) return <p>Something went wrong.</p>;

  return (
    <div>
      <TripHeader lastUpdated={gps?.last_updated} />

      <section style={{ height: "240px" }}>
        <LiveMap gps={gps} route={trip.route} />
      </section>

      <section style={{ padding: "1rem" }}>
        <StopList route={trip.route} />
      </section>
    </div>
  );
};
