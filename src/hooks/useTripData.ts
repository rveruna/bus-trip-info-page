import { useEffect, useState } from "react";
import type { Vehicle, LocationTime } from "@/types/trip";

interface TripData {
  route: LocationTime[];
  vehicle: Vehicle;
}

export function useTripData() {
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch("/mock-trip.json"); // replace later with real API
        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        setTrip({ route: data.route, vehicle: data.vehicle });
      } catch (err) {
        console.error("[debug] Failed to fetch trip:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, []);

  return {
    trip,
    gps: trip?.vehicle?.gps || null,
    loading,
    error,
  };
}
