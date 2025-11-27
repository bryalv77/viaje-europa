import { db } from '@/lib/firebase';
import { ref, onValue, push, update, off, remove } from 'firebase/database';
import { TripItem } from '@/types';

export const getTripItems = (callback: (items: TripItem[]) => void) => {
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
