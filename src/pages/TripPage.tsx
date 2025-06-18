import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useTripData } from "../hooks/useTripData";
import { StopList } from "../components/StopList";

export const TripPage = () => {
  const { trip, gps, loading, error } = useTripData();

  if (loading) return <p>Loading trip...</p>;
  if (error || !trip) return <p>Something went wrong.</p>;

  return (
    <div>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          Trip Info
        </h1>
        {gps && (
          <p style={{ fontSize: "0.875rem", color: "#555" }}>
            Last updated: {gps.last_updated}
          </p>
        )}
      </header>

      <section style={{ height: "240px" }}>
        {gps && (
          <MapContainer
            center={[gps.latitude, gps.longitude]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[gps.latitude, gps.longitude]} />
          </MapContainer>
        )}
      </section>

      <section style={{ padding: "1rem" }}>
        <StopList route={trip.route} />
      </section>
    </div>
  );
};
