import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { useTripData } from "../hooks/useTripData";
import { StopList } from "../components/StopList";
import L from "leaflet";

export const TripPage = () => {
  const { trip, gps, loading, error } = useTripData();

  if (loading) return <p>Loading trip...</p>;
  if (error || !trip) return <p>Something went wrong.</p>;

  const stopCoords = trip.route.map((stop) => [
    stop.location.lat,
    stop.location.lon,
  ]) as [number, number][];

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
        <MapContainer
          center={
            gps
              ? [gps.latitude, gps.longitude]
              : stopCoords[0] || [55.9533, -3.1883]
          }
          zoom={10}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Vehicle marker */}
          {gps && (
            <Marker
              position={[gps.latitude, gps.longitude]}
              icon={L.divIcon({
                className: "bus-icon",
                html: "🚌",
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
            >
              <Popup>Bus position</Popup>
            </Marker>
          )}

          {/* Stop markers */}
          {trip.route.map((stop) => (
            <Marker
              key={stop.id}
              position={[stop.location.lat, stop.location.lon]}
            >
              <Popup>{stop.location.name}</Popup>
            </Marker>
          ))}

          {/* Route line */}
          {stopCoords.length > 1 && (
            <Polyline positions={stopCoords} color="#007bff" />
          )}
        </MapContainer>
      </section>

      <section style={{ padding: "1rem" }}>
        <StopList route={trip.route} />
      </section>
    </div>
  );
};
