import L from "leaflet";

export const createStopDotIcon = () =>
  L.divIcon({
    className: "stop-dot-icon",
    html: `<div class="stop-dot"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
