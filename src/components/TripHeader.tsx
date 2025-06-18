import { formatTime } from "../utils/formatTime";

interface TripHeaderProps {
  lastUpdated?: string;
}

export const TripHeader = ({ lastUpdated }: TripHeaderProps) => {
  return (
    <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Trip Info</h1>
      {lastUpdated && (
        <p style={{ fontSize: "0.875rem", color: "#555" }}>
          Last updated: {formatTime(lastUpdated)}
        </p>
      )}
    </header>
  );
};
