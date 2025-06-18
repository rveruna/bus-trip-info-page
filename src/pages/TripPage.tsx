import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTripData } from "../hooks/useTripData";

const tripId = "REPLACE_WITH_TRIP_UID";

export const TripPage = () => {
  const { stops, vehicle, nextStop, loading, error } = useTripData(tripId);

  const gps = vehicle?.gps;
  const center = gps ? [gps.latitude, gps.longitude] : [56.4907, -4.2026]; // fallback center

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Trip Page</h1>

      {loading && <p>Loading trip data…</p>}
      {error && <p style={{ color: "red" }}>Failed to load trip data.</p>}

      {!loading && !error && (
        <>
          <p>
            Last updated:{" "}
            {gps?.last_updated
              ? new Date(gps.last_updated).toLocaleTimeString()
              : "N/A"}
          </p>

          <section style={{ height: "240px", marginTop: "1rem" }}>
            <MapContainer
              center={center as [number, number]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {gps && <Marker position={[gps.latitude, gps.longitude]} />}
            </MapContainer>
          </section>
        </>
      )}
    </div>
  );
};
