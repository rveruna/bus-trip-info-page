import { formatTime } from '../../utils/formatTime';
import styles from './styles.module.css';

interface TripHeaderProps {
  lastUpdated?: string;
  /** The journey being followed, for example "Dundee → Edinburgh". */
  route?: string;
  /** A button in the header. It only shows on wide screens, where the page is not already on a phone. */
  action?: { label: string; onClick: () => void };
}

export const TripHeader = ({ lastUpdated, route, action }: TripHeaderProps) => {
  return (
    <header className={styles.container}>
      <h1 className={styles.title}>Trip Info</h1>
      {route && <p className={styles.route}>{route}</p>}
      {lastUpdated && <p className={styles.updated}>Last updated: {formatTime(lastUpdated)}</p>}
      {action && (
        <button type="button" className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </header>
  );
};
