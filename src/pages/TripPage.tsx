import { useEffect, useState } from 'react';
import { PhoneView } from '../components/PhoneView';
import { isEmbedded, readRoute, routeSearch } from '../utils/routeParams';
import { TripView } from './TripView';

export const TripPage = () => {
  const [embedded] = useState(() => isEmbedded(window.location.search));
  const [route, setRoute] = useState(() => readRoute(window.location.search));
  const [phoneView, setPhoneView] = useState(false);

  // Keep the address in step with the route so the page can be shared.
  useEffect(() => {
    window.history.replaceState(null, '', routeSearch(route.origin, route.destination, embedded));
  }, [route, embedded]);

  if (phoneView) return <PhoneView route={route} onClose={() => setPhoneView(false)} />;

  return (
    <TripView
      route={route}
      onRouteChange={setRoute}
      onViewOnPhone={embedded ? undefined : () => setPhoneView(true)}
    />
  );
};
