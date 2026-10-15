import L from 'leaflet';

// The dot is 12px, but the marker is 24px so it is big enough to tap (WCAG 2.2 target size).
export const createStopDotIcon = () =>
  L.divIcon({
    className: 'stop-dot-icon',
    html: `<div class="stop-dot"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
