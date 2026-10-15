import L from 'leaflet';

export const createBusIcon = (heading: number = 0, colour: string = '#4c8a78', selected: boolean = false) =>
  L.divIcon({
    className: 'bus-icon',
    iconSize: [24, 28],
    iconAnchor: [12, 14],
    html: `
      <svg width="24" height="28" viewBox="-2 0 24 28"
        xmlns="http://www.w3.org/2000/svg"
        style="transform: rotate(${heading}deg);">
        <!-- Arrow showing the direction of travel -->
        <polygon points="10,2 15,10 5,10" fill="#d04444" />
        <!-- Dot, outlined when this is the bus being followed -->
        <circle cx="10" cy="18" r="8" fill="${colour}" stroke="${selected ? '#111' : '#fff'}" stroke-width="${selected ? 2.5 : 1.5}"/>
      </svg>
    `,
  });
