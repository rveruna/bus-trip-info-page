import type { Trip } from "@/types/trip";

type Props = {
  route: Trip["route"];
};

export const StopList = ({ route }: Props) => {
  const now = new Date();

  const findNextStopIndex = () => {
    return route.findIndex((stop) => {
      const est = new Date(stop.arrival.estimated || stop.arrival.scheduled);
      return est > now && !stop.skipped;
    });
  };

  const nextIndex = findNextStopIndex();

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {route.map((stop, i) => {
        const isNext = i === nextIndex;
        return (
          <li key={stop.id} style={{ marginBottom: "1rem" }}>
            {isNext && <small style={{ color: "#999" }}>Next stop</small>}
            <div style={{ fontWeight: isNext ? "bold" : "normal" }}>
              {stop.location.name}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#555" }}>
              {stop.arrival.scheduled} → {stop.arrival.estimated}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
