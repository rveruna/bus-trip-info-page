export interface TripResponse {
  route: LocationTime[];
  vehicle: Vehicle;
}

export interface Trip {
  id: string;
  route: {
    id: number;
    arrival: {
      scheduled: string;
      estimated: string;
    };
    location: {
      name: string;
    };
    skipped: boolean;
  }[];
  vehicle?: {
    gps: {
      latitude: number;
      longitude: number;
      last_updated: string;
    };
  };
}

export interface LocationTime {
  id: number;
  arrival: TimeInfo;
  departure: TimeInfo;
  location: Location;
  skipped: boolean;
}

export interface TimeInfo {
  scheduled: string;
  estimated: string;
  actual?: string;
}

export interface Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

export interface Vehicle {
  gps: {
    latitude: number;
    longitude: number;
    heading?: number;
    last_updated: string;
  };
}

export interface Place {
  id: number;
  name: string;
  region_name?: string;
  has_future_activity: boolean;
}

export interface Quote {
  legs?:
    | {
        trip_uid?: string;
        departure?: { scheduled?: string };
        arrival?: { scheduled?: string };
      }[]
    | null;
}

/** A trip the page can show: where it is in its journey, its stops and where its bus is. */
export interface TripRef {
  uid: string;
  departure: string;
  arrival: string;
  /** False when no bus is running yet and this is just the next departure. */
  inProgress: boolean;
}

export interface LiveTrip extends TripRef {
  route: LocationTime[];
  gps: Vehicle['gps'] | null;
}
