import { formatTime } from "../../utils/formatTime";
import styles from "./styles.module.css";

interface TripHeaderProps {
  lastUpdated?: string;
}

export const TripHeader = ({ lastUpdated }: TripHeaderProps) => {
  return (
    <header className={styles.container}>
      <h1 className={styles.title}>Trip Info</h1>
      {lastUpdated && (
        <p className={styles.updated}>
          Last updated: {formatTime(lastUpdated)}
        </p>
      )}
    </header>
  );
};
