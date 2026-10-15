import { createBusIcon } from '../createBusIcon';
import L from 'leaflet';

describe('createBusIcon', () => {
  it('creates a Leaflet divIcon with correct default properties', () => {
    const icon = createBusIcon();

    expect(icon).toBeInstanceOf(L.DivIcon);
    expect(icon.options.className).toBe('bus-icon');
    expect(icon.options.iconSize).toEqual([24, 28]);
    expect(icon.options.iconAnchor).toEqual([12, 14]);
    expect(icon.options.html).toContain('transform: rotate(0deg);');
  });

  it('rotates the SVG by given heading', () => {
    const icon = createBusIcon(90);
    expect(icon.options.html).toContain('transform: rotate(90deg);');
  });

  it('colours the bus so several buses can be told apart', () => {
    expect(createBusIcon(0, '#D55E00').options.html).toContain('fill="#D55E00"');
  });

  it('outlines the bus being followed', () => {
    expect(createBusIcon(0, '#D55E00', true).options.html).toContain('stroke="#111"');
    expect(createBusIcon(0, '#D55E00', false).options.html).toContain('stroke="#fff"');
  });
});
