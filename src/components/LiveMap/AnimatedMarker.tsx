import { useEffect, useRef } from 'react';
import { Marker } from 'react-leaflet';
import type { ComponentProps } from 'react';
import type { Marker as LeafletMarker } from 'leaflet';

const GLIDE_MS = 3000;

type Props = Omit<ComponentProps<typeof Marker>, 'position'> & { position: [number, number] };

/** A marker that glides to each new position, so a bus visibly moves along the route between refreshes. */
export const AnimatedMarker = ({ position, ...rest }: Props) => {
  const markerRef = useRef<LeafletMarker>(null);
  // react-leaflet moves the marker the moment its `position` prop changes, which would skip the glide. It is
  // given the first position only, and the effect below does all the moving.
  const initial = useRef(position);
  const [lat, lng] = position;

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const start = marker.getLatLng();
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || (start.lat === lat && start.lng === lng)) {
      marker.setLatLng([lat, lng]);
      return;
    }

    let frame = 0;
    const began = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - began) / GLIDE_MS);
      marker.setLatLng([start.lat + (lat - start.lat) * progress, start.lng + (lng - start.lng) * progress]);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [lat, lng]);

  return <Marker ref={markerRef} position={initial.current} {...rest} />;
};
