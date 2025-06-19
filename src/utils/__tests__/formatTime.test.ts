import { formatTime } from "../formatTime";

describe("formatTime", () => {
  it("formats a string date correctly", () => {
    const input = "2024-06-19T08:45:00Z";
    const result = formatTime(input);
    expect(result).toBe("09:45");
  });

  it("formats a Date object correctly", () => {
    const date = new Date("2024-06-19T15:30:00Z");
    const result = formatTime(date);
    expect(result).toBe("16:30");
  });

  it("returns consistent hour and minute format", () => {
    const result = formatTime(new Date("2024-06-19T09:07:00Z"));
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});
