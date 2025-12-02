import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

const TRIP_ID_KEY = 'current_trip_id';

export function useCurrentTrip() {
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTripId() {
      const storedTripId = await storage.getItem(TRIP_ID_KEY);
      setCurrentTripId(storedTripId);
      setLoading(false);
    }
    loadTripId();
  }, []);

  const setTripId = async (tripId: string | null) => {
    setCurrentTripId(tripId);
    if (tripId) {
      await storage.setItem(TRIP_ID_KEY, tripId);
    } else {
      await storage.removeItem(TRIP_ID_KEY);
    }
  };

  return { currentTripId, setCurrentTripId: setTripId, loading };
}
