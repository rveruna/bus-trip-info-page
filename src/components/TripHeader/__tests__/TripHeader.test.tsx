import { render } from "@testing-library/react";
import { TripHeader } from "../TripHeader";

describe("TripHeader", () => {
  it("renders the title", () => {
    const { getByText } = render(<TripHeader />);
    expect(getByText("Trip Info")).toBeTruthy();
  });

  it("shows last updated time when provided", () => {
    const { getByText } = render(
      <TripHeader lastUpdated="2024-06-19T13:45:00Z" />
    );
    expect(getByText(/last updated: 13:45/i)).toBeTruthy();
  });

  it("does not show last updated when prop is missing", () => {
    const { queryByText } = render(<TripHeader />);
    expect(queryByText(/last updated/i)).toBeNull();
  });
});
