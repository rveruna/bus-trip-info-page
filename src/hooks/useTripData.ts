import { useEffect, useState } from "react";
import type { TripResponse, LocationTime, Vehicle } from "../types/trip";

interface UseTripDataResult {
  stops: LocationTime[];
  vehicle: Vehicle | null;
  nextStop: LocationTime | null;
  loading: boolean;
  error: boolean;
}

export function useTripData(tripId: string): UseTripDataResult {
  const [stops, setStops] = useState<LocationTime[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [nextStop, setNextStop] = useState<LocationTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `https://api.ember.to/v1/trips/${tripId}?all=true`
        );
        if (!res.ok) throw new Error("API error");
        const data: TripResponse = await res.json();

        const orderedStops = data.route.sort(
          (a, b) =>
            new Date(a.arrival.scheduled).getTime() -
            new Date(b.arrival.scheduled).getTime()
        );
        setStops(orderedStops);
        setVehicle(data.vehicle);

        const now = new Date();
        const upcoming = orderedStops.find(
          (s) => new Date(s.arrival.estimated) > now && !s.skipped
        );
        setNextStop(upcoming || null);
      } catch (e) {
        console.error("[debug] Failed to fetch trip:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchTrip();

    const interval = setInterval(fetchTrip, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [tripId]);

  return { stops, vehicle, nextStop, loading, error };
}
