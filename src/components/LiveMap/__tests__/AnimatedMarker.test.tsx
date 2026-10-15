import { act, render } from '@testing-library/react';
import L from 'leaflet';
import { MapContainer } from 'react-leaflet';
import { AnimatedMarker } from '../AnimatedMarker';

const marker = (position: [number, number]) => (
  <MapContainer center={[0, 0]} zoom={5}>
    <AnimatedMarker position={position} />
  </MapContainer>
);

describe('AnimatedMarker', () => {
  let frames: FrameRequestCallback[];
  let setLatLng: jest.SpiedFunction<typeof L.Marker.prototype.setLatLng>;

  const lastPosition = () => {
    const { lat, lng } = L.latLng(setLatLng.mock.calls.at(-1)![0] as L.LatLngExpression);
    return { lat, lng };
  };
  const runFrameAt = (ms: number) => act(() => frames.shift()?.(ms));

  beforeEach(() => {
    frames = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => frames.push(cb));
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    jest.spyOn(performance, 'now').mockReturnValue(0);
    setLatLng = jest.spyOn(L.Marker.prototype, 'setLatLng');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('glides to a new position instead of jumping', () => {
    const { rerender } = render(marker([10, 10]));

    rerender(marker([20, 30]));
    runFrameAt(1500);
    expect(lastPosition().lat).toBeCloseTo(15);
    expect(lastPosition().lng).toBeCloseTo(20);

    runFrameAt(3000);
    expect(lastPosition()).toEqual({ lat: 20, lng: 30 });
  });

  it('jumps straight to the new position when the user prefers reduced motion', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { rerender } = render(marker([10, 10]));

    rerender(marker([20, 30]));

    expect(lastPosition()).toEqual({ lat: 20, lng: 30 });
    expect(frames).toHaveLength(0);
  });
});
