import type { Trip } from "@/types/trip";
import { formatTime } from "../../utils/formatTime";
import styles from "./styles.module.css";

type Props = {
  route: Trip["route"];
};

export const StopList = ({ route }: Props) => {
  const now = new Date();

  const findNextStopIndex = () =>
    route.findIndex((stop) => {
      const est = new Date(stop.arrival.estimated ?? stop.arrival.scheduled);
      return est > now && !stop.skipped;
    });

  const nextIndex = findNextStopIndex();

  return (
    <ul className={styles.list}>
      {route.map((stop, i) => {
        const isNext = i === nextIndex;
        const isLast = i === route.length - 1;

        const scheduled = new Date(stop.arrival.scheduled);
        const estimated = stop.arrival.estimated
          ? new Date(stop.arrival.estimated)
          : null;

        const isDelayed = estimated ? estimated > scheduled : false;
        const delayMinutes = estimated
          ? Math.round((+estimated - +scheduled) / 60000)
          : 0;

        return (
          <li
            key={stop.id}
            className={styles.item}
            style={{ paddingBottom: isLast ? 0 : "2rem" }}
          >
            {!isLast && <span className={styles.line} />}
            <span className={styles.dot} />

            <div>
              {isNext && <small className={styles.next}>Next stop</small>}
              <div className={isNext ? styles.nameBold : styles.name}>
                {stop.location.name}
              </div>
              <div className={styles.time}>
                {formatTime(scheduled)} →{" "}
                <span style={{ color: isDelayed ? "#d00" : "#555" }}>
                  {formatTime(estimated || scheduled)}
                  {isDelayed && (
                    <span className={styles.delay}> (+{delayMinutes} min)</span>
                  )}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
