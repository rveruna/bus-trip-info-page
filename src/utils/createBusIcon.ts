import L from "leaflet";

export const createBusIcon = (heading: number = 0) =>
  L.divIcon({
    className: "bus-icon",
    iconSize: [20, 28],
    iconAnchor: [10, 14],
    html: `
      <svg width="20" height="28" viewBox="0 0 20 28"
        xmlns="http://www.w3.org/2000/svg"
        style="transform: rotate(${heading}deg);">
        <!-- Arrow moved closer to the dot -->
        <polygon points="10,2 15,10 5,10" fill="#d04444" />
        <!-- Dot -->
        <circle cx="10" cy="18" r="8" fill="#4c8a78"/>
        <!-- inner dot -->
        <!-- <circle cx="10" cy="18" r="5.5" fill="#4c8a78"/> -->
      </svg>
    `,
  });
