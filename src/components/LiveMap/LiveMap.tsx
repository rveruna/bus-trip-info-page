import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LiveTrip } from '@/types/trip';
import { busColour } from '../../utils/busColours';
import { createStopDotIcon } from '../../utils/createStopDotIcon';
import { createBusIcon } from '../../utils/createBusIcon';
import { formatTime } from '../../utils/formatTime';
import { isStale } from '../../utils/gps';
import { AnimatedMarker } from './AnimatedMarker';

type Props = {
  trips: LiveTrip[];
  selectedUid: string;
  onSelect: (uid: string) => void;
};

const toCoords = (trip: LiveTrip) =>
  trip.route.map((stop) => [stop.location.lat, stop.location.lon]) as [number, number][];

/** Frames the followed trip's route when the page opens or the followed bus changes, not on every refresh. */
const FitRoute = ({ coords, uid }: { coords: [number, number][]; uid: string }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 1) map.fitBounds(coords, { padding: [24, 24] });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-framing on each refresh would fight the user's panning
  }, [uid, map]);
  return null;
};

export const LiveMap = ({ trips, selectedUid, onSelect }: Props) => {
  const selected = trips.find((trip) => trip.uid === selectedUid) ?? trips[0];
  const selectedCoords = toCoords(selected);
  const now = new Date();

  return (
    <MapContainer
      center={selectedCoords[0] ?? [55.9533, -3.1883]}
      zoom={8}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <FitRoute coords={selectedCoords} uid={selected.uid} />

      {trips.map((trip, i) =>
        trip.uid === selected.uid ? null : (
          <Polyline
            key={trip.uid}
            positions={toCoords(trip)}
            pathOptions={{ color: busColour(i), weight: 3, opacity: 0.35 }}
          />
        ),
      )}
      {selectedCoords.length > 1 && (
        <Polyline
          positions={selectedCoords}
          pathOptions={{ color: busColour(trips.indexOf(selected)), weight: 5 }}
        />
      )}

      {selected.route.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.location.lat, stop.location.lon]}
          icon={createStopDotIcon()}
          title={stop.location.name}
          // Out of the tab order: a route has up to 31 stops, close together, and the stop list below the map is
          // the way to read them with a keyboard or a screen reader.
          keyboard={false}
        >
          <Popup>{stop.location.name}</Popup>
        </Marker>
      ))}

      {trips.map((trip, i) =>
        trip.gps && !isStale(trip.gps, now) ? (
          <AnimatedMarker
            key={trip.uid}
            position={[trip.gps.latitude, trip.gps.longitude]}
            icon={createBusIcon(trip.gps.heading, busColour(i), trip.uid === selected.uid)}
            title={`Bus ${i + 1}, ${formatTime(trip.departure)} departure`}
            zIndexOffset={trip.uid === selected.uid ? 2000 : 1000}
            eventHandlers={{ click: () => onSelect(trip.uid) }}
          >
            <Popup>
              Bus {i + 1}, {formatTime(trip.departure)} departure
            </Popup>
          </AnimatedMarker>
        ) : null,
      )}
    </MapContainer>
  );
};
