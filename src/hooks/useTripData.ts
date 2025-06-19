import { useEffect, useState } from "react";
import type { Vehicle, LocationTime } from "@/types/trip";

interface TripData {
  route: LocationTime[];
  vehicle: Vehicle;
}

const getQuotesUrl = () => {
  const today = new Date().toISOString().split("T")[0];
  return `https://api.ember.to/v1/quotes/?origin=13&destination=42&departure_date_from=${today}T00:00:00Z&departure_date_to=${today}T23:59:59Z`;
};

export function useTripData() {
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTrip = async () => {
    try {
      const res = await fetch(getQuotesUrl());
      if (!res.ok) throw new Error("Quotes fetch failed");
      const { quotes } = await res.json();

      if (!Array.isArray(quotes)) {
        throw new Error("Quotes is not an array");
      }

      const now = new Date();

      const upcomingQuote = quotes.find((q) => {
        const leg = q.legs?.[0];
        const dep = leg?.departure?.scheduled;
        return leg?.trip_uid && dep && new Date(dep) > now;
      });

      if (!upcomingQuote) {
        throw new Error("No future trips found");
      }

      const tripUid = upcomingQuote.legs[0].trip_uid;

      const tripRes = await fetch(`https://api.ember.to/v1/trips/${tripUid}/`);
      if (!tripRes.ok) throw new Error("Trip fetch failed");
      const data = await tripRes.json();

      setTrip({ route: data.route, vehicle: data.vehicle });
    } catch (err) {
      console.error("[debug] Failed to fetch trip:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
    const interval = setInterval(fetchTrip, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return {
    trip,
    gps: trip?.vehicle?.gps || null,
    loading,
    error,
  };
}
