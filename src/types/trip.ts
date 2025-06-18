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
