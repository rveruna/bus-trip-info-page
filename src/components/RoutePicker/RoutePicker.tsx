import type { Place } from '@/types/trip';
import styles from './styles.module.css';

type Props = {
  places: Place[];
  origin: number;
  destination: number;
  onOriginChange: (id: number) => void;
  onDestinationChange: (id: number) => void;
  onSwap: () => void;
};

export const RoutePicker = ({
  places,
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
}: Props) => {
  const sorted = [...places].sort((a, b) => a.name.localeCompare(b.name));

  const select = (label: string, id: number, onChange: (id: number) => void) => (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <select value={id} onChange={(event) => onChange(Number(event.target.value))}>
        {!sorted.some((place) => place.id === id) && <option value={id}>Stop {id}</option>}
        {sorted.map((place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <form className={styles.picker} aria-label="Choose a route" onSubmit={(event) => event.preventDefault()}>
      {select('From', origin, onOriginChange)}
      <button type="button" className={styles.swap} onClick={onSwap} aria-label="Swap from and to">
        ⇄
      </button>
      {select('To', destination, onDestinationChange)}
    </form>
  );
};
