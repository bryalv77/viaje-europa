import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from 'react';
import { useAuth } from './useAuth';
import { getTrips, getTripItemsFromTrip } from '@/api/firebase';
import { ParticipantObject, Trip, TripItem } from '@/types';

interface TripsContextType {
  trips: Trip[];
  tripItems: TripItem[];
  loading: boolean;
  participants: ParticipantObject;
  error: Error | null;
  refetch: () => void;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export function TripsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [participants, setParticipants] = useState<ParticipantObject>({});
  const [tripItems, setTripItems] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTripsAndItems = async () => {
    if (!user) {
      setTrips([]);
      setTripItems([]);
      setParticipants({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userTrips = await getTrips(user.uid);
      setTrips(userTrips);

      const allTripItems: TripItem[] = [];
      for (const trip of userTrips) {
        setParticipants(trip.participants)
        const items = await getTripItemsFromTrip(trip.tripId);
        allTripItems.push(...items);
      }
      setTripItems(allTripItems);

      setError(null);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsAndItems();
  }, [user]);

  const value = {
    trips,
    tripItems,
    loading,
    error,
    participants,
    refetch: fetchTripsAndItems,
  };

  return (
    <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
  );
}

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};
