export interface TripResponse {
  route: LocationTime[];
  vehicle: Vehicle;
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
