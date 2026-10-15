import type { Route } from '../../utils/routeParams';
import { routeSearch } from '../../utils/routeParams';
import styles from './styles.module.css';

type Props = {
  route: Route;
  onClose: () => void;
};

/**
 * The page as it looks on a phone: this same page, loaded in a frame at phone width with `?embed=1`. A frame
 * has a real phone-sized viewport, so the layout, the map's dragging and the scrolling all behave as they do
 * on a phone, with no scaling tricks. The bezel is decoration only.
 */
export const PhoneView = ({ route, onClose }: Props) => (
  <main className={styles.stage}>
    <h1 className={styles.heading}>On a phone</h1>
    <button type="button" className={styles.close} onClick={onClose}>
      Back to full screen
    </button>

    <div className={styles.device}>
      <span className={styles.speaker} aria-hidden="true" />
      <iframe
        className={styles.screen}
        title="Bus trip info, shown at phone width"
        src={`${window.location.pathname}${routeSearch(route.origin, route.destination, true)}`}
      />
    </div>
  </main>
);
