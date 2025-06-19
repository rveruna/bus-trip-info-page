import { render } from "@testing-library/react";
import { TripHeader } from "../TripHeader";
import { formatTime } from "@/utils/formatTime";

describe("TripHeader", () => {
  it("renders the title", () => {
    const { getByText } = render(<TripHeader />);
    expect(getByText("Trip Info")).toBeTruthy();
  });

  it("shows last updated time when provided", () => {
    const input = "2024-06-19T13:45:00Z";
    const ukTime = formatTime(input);

    const { getByText } = render(<TripHeader lastUpdated={input} />);
    expect(getByText(new RegExp(`last updated: ${ukTime}`, "i"))).toBeTruthy();
  });

  it("does not show last updated when prop is missing", () => {
    const { queryByText } = render(<TripHeader />);
    expect(queryByText(/last updated/i)).toBeNull();
  });
});
