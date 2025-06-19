import { render, screen } from "@testing-library/react";
import { StopList } from "../StopList";
import type { Trip } from "../../../types/trip";

const mockRoute: Trip["route"] = [
  {
    id: 1,
    location: { name: "Stop A" },
    arrival: {
      scheduled: new Date(Date.now() - 10 * 60000).toISOString(), // 10 min ago
      estimated: "14:20",
    },
    skipped: false,
  },
  {
    id: 2,
    location: { name: "Stop B" },
    arrival: {
      scheduled: new Date(Date.now() + 10 * 60000).toISOString(), // 10 min ahead
      estimated: new Date(Date.now() + 15 * 60000).toISOString(), // 15 min ahead
    },
    skipped: false,
  },
  {
    id: 3,
    location: { name: "Stop C" },
    arrival: {
      scheduled: new Date(Date.now() + 30 * 60000).toISOString(),
      estimated: "15:30",
    },
    skipped: false,
  },
];

describe("StopList", () => {
  it("renders all stops", () => {
    render(<StopList route={mockRoute} />);
    expect(screen.getByText("Stop A")).toBeTruthy();
    expect(screen.getByText("Stop B")).toBeTruthy();
    expect(screen.getByText("Stop C")).toBeTruthy();
  });

  it("displays the next stop label correctly", () => {
    render(<StopList route={mockRoute} />);
    expect(screen.getByText(/Next stop/i)).toBeTruthy();
  });

  it("displays delay when estimated > scheduled", () => {
    render(<StopList route={mockRoute} />);
    expect(screen.getByText(/\(\+5 min\)/)).toBeTruthy();
  });
});
