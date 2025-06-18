import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export const TripPage = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <h1>Trip Page</h1>
      <p>This is where the trip data will appear.</p>

      <section style={{ height: "240px", marginTop: "1rem" }}>
        <MapContainer
          center={[56.4907, -4.2026]} // center of Scotland
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </section>
    </div>
  );
};
