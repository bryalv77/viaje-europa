import { db } from '@/lib/firebase';
import { ref, onValue, push, update, off, remove } from 'firebase/database';
import { Trip, TripItem, UserData } from '@/types';

export const getAllTripItems = (callback: (items: TripItem[]) => void) => {
  const itemsRef = ref(db);
  const listener = onValue(itemsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const items: TripItem[] = Object.keys(data)
        .map((key) => ({
          ...data[key],
          id: key,
        }))
        // The last item of the list is the summary, so we filter it out
        .filter((item) => item.id !== '30');
      callback(items);
    } else {
      callback([]);
    }
  });

  return () => off(itemsRef, 'value', listener);
};

export const getTripItemsFromTrip = async (tripId: string): Promise<TripItem[]> => {
  const itemsRef = ref(db, `/trips/${tripId}/items`);
  const snapshot = await new Promise<any>((resolve) => {
    onValue(itemsRef, (snap) => {
      resolve(snap);
    });
  });
  const data = snapshot.val();
  if (data) {
    return Object.keys(data).map((key) => ({ ...data[key], id: key }));
  }
  return [];
};

export const addTripItem = (item: Omit<TripItem, 'id'>) => {
  const itemsRef = ref(db);
  return push(itemsRef, item);
};

export const updateTripItem = (item: TripItem) => {
  const itemRef = ref(db, `/${item.id}`);
  return update(itemRef, item);
};

export const deleteTripItem = (id: string) => {
  const itemRef = ref(db, `/${id}`);
  return remove(itemRef);
};

export const addTrip = async (userId: string, tripData: { name: string, description: string }) => {
  const tripsRef = ref(db, `/trips`);
  const newTripRef = push(tripsRef);
  const newTripId = newTripRef.key;

  if (!newTripId) {
    throw new Error("Failed to generate new trip ID.");
  }

  await update(newTripRef, { ...tripData, userId: userId, items: {} });

  // Update user's trips array
  const userTripsRef = ref(db, `/users/${userId}/trips`);
  const snapshot = await new Promise<any>((resolve) => {
    onValue(userTripsRef, (snap) => {
      resolve(snap);
    });
  });
  const currentTrips = snapshot.val() || [];
  await update(userTripsRef, [...currentTrips, newTripId]);

  return newTripId;
};

export const getTrip = async (tripId: string): Promise<Trip | null> => {
  const itemRef = ref(db, `/trips/${tripId}`);
  const snapshot = await new Promise<any>((resolve) => {
    onValue(itemRef, (snap) => {
      resolve(snap);
    });
  });
  const data = snapshot.val();
  if (data) {
    return { ...data, id: tripId};
  }
  return null;
};

export const getTrips = async (userId: string): Promise<Trip[]> => {
  const userData = await getUserData(userId);
  if (!userData || !userData.trips) {
    return [];
  }

  const tripPromises = userData.trips.map((tripId) => getTrip(tripId));
  const trips = await Promise.all(tripPromises);
  return trips.filter((trip) => trip !== null) as Trip[];
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  const userRef = ref(db, `/users/${userId}`);
  const snapshot = await new Promise<any>((resolve) => {
    onValue(userRef, (snap) => {
      resolve(snap);
    });
  });
  const data = snapshot.val();
  if (data) {
    return data;
  }
  return null;
};