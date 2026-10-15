import { useEffect, useState } from 'react';
import { fetchLocations } from '@/api/ember';
import type { Place } from '@/types/trip';

/** Places a bus can run from or to. The page still works without them; it just can't offer a picker. */
export function useLocations(): Place[] {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchLocations()
      .then((all) => {
        if (!cancelled) setPlaces(all.filter((place) => place.has_future_activity));
      })
      .catch((err) => console.error('[debug] Failed to fetch locations:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  return places;
}
