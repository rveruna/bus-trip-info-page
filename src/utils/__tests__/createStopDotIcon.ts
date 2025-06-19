import { createStopDotIcon } from "../createStopDotIcon";
import L from "leaflet";

describe("createStopDotIcon", () => {
  it("creates a Leaflet divIcon with expected properties", () => {
    const icon = createStopDotIcon();

    expect(icon).toBeInstanceOf(L.DivIcon);
    expect(icon.options.className).toBe("stop-dot-icon");
    expect(icon.options.iconSize).toEqual([16, 16]);
    expect(icon.options.iconAnchor).toEqual([8, 8]);
    expect(icon.options.html).toContain('<div class="stop-dot"></div>');
  });
});
