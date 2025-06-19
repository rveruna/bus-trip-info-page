import { createBusIcon } from "../createBusIcon";
import L from "leaflet";

describe("createBusIcon", () => {
  it("creates a Leaflet divIcon with correct default properties", () => {
    const icon = createBusIcon();

    expect(icon).toBeInstanceOf(L.DivIcon);
    expect(icon.options.className).toBe("bus-icon");
    expect(icon.options.iconSize).toEqual([20, 28]);
    expect(icon.options.iconAnchor).toEqual([10, 14]);
    expect(icon.options.html).toContain("transform: rotate(0deg);");
  });

  it("rotates the SVG by given heading", () => {
    const icon = createBusIcon(90);
    expect(icon.options.html).toContain("transform: rotate(90deg);");
  });
});
