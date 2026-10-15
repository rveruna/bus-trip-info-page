import type { LiveTrip } from '@/types/trip';
import { busColour } from '../../utils/busColours';
import { formatTime } from '../../utils/formatTime';
import { describeDelay, getDelayMinutes } from '../../utils/stops';
import styles from './styles.module.css';

type Props = {
  trips: LiveTrip[];
  selectedUid: string;
  onSelect: (uid: string) => void;
};

export const TripSelector = ({ trips, selectedUid, onSelect }: Props) => {
  const now = new Date();

  return (
    <ul className={styles.list} aria-label="Buses on this route">
      {trips.map((trip, i) => {
        const status = trip.inProgress ? describeDelay(getDelayMinutes(trip.route, now)) : 'not yet running';
        return (
          <li key={trip.uid}>
            <button
              type="button"
              className={styles.button}
              aria-pressed={trip.uid === selectedUid}
              onClick={() => onSelect(trip.uid)}
            >
              <span className={styles.swatch} style={{ background: busColour(i) }} aria-hidden="true" />
              <span>
                <strong>Bus {i + 1}</strong>, {formatTime(trip.departure)} departure
                <small className={styles.status}>{status}</small>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
