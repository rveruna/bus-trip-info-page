import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import type { LocationTime, Vehicle } from "@/types/trip";

type Props = {
  gps: Vehicle["gps"] | null;
  route: LocationTime[];
};

export const LiveMap = ({ gps, route }: Props) => {
  const stopCoords = route.map((stop) => [
    stop.location.lat,
    stop.location.lon,
  ]) as [number, number][];

  return (
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

      {route.map((stop) => (
        <Marker key={stop.id} position={[stop.location.lat, stop.location.lon]}>
          <Popup>{stop.location.name}</Popup>
        </Marker>
      ))}

      {stopCoords.length > 1 && (
        <Polyline positions={stopCoords} color="#007bff" />
      )}
    </MapContainer>
  );
};
