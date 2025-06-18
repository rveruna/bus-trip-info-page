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

  const dotColor = "#ccc";
  const lineColor = "#ccc";

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {route.map((stop, i) => {
        const isNext = i === nextIndex;
        const isLast = i === route.length - 1;

        return (
          <li
            key={stop.id}
            style={{
              position: "relative",
              paddingLeft: "3.25rem",
              paddingBottom: isLast ? 0 : "2rem",
            }}
          >
            {/* vertical line */}
            {!isLast && (
              <span
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  left: "1.375rem",
                  width: "2px",
                  height: "calc(100% - 1.25rem)",
                  backgroundColor: lineColor,
                }}
              />
            )}

            {/* dot */}
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "0.75rem",
                width: "1.25rem",
                height: "1.25rem",
                borderRadius: "50%",
                backgroundColor: dotColor,
                border: "2px solid white",
                boxShadow: `0 0 0 1px ${dotColor}`,
              }}
            />

            {/* content */}
            <div>
              {isNext && <small style={{ color: "#999" }}>Next stop</small>}
              <div style={{ fontWeight: isNext ? "bold" : "normal" }}>
                {stop.location.name}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#555" }}>
                {stop.arrival.scheduled} → {stop.arrival.estimated}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
