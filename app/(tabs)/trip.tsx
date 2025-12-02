import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TripItem } from '@/types';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Input, InputField } from '@/components/ui/input';
import TripListItem from '@/components/TripListItem';
import { useTrips } from '@/hooks/useTrips';
import { useAuth } from '@/hooks/useAuth'; // Added import for useAuth
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ChevronDownIcon } from 'lucide-react-native';

export default function TripScreen() {
  const { trips, tripItems, participants, loading, currentTripId, setCurrentTripId, loadingTripId } = useTrips();
  const [sortedItems, setSortedItems] = useState<TripItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<TripItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextEvent, setNextEvent] = useState<TripItem | null>(null);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();


  useEffect(() => {
    if (tripItems) {
      const sorted = [...tripItems].sort(
        (a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0)
      );
      setSortedItems(sorted);

      const now = new Date();
      const futureEvent = sorted.find(
        (item) => item.startDate && item.startDate > now
      );
      setNextEvent(futureEvent || null);
    }
  }, [tripItems]);

  useEffect(() => {
    if (!nextEvent || !nextEvent.startDate) {
      setCountdown(null);
      return;
    }

    const calculateCountdown = () => {
      const eventDate = nextEvent.startDate!;
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown(null);
        const now = new Date();
        const futureEvent = sortedItems.find(
          (item) => item.startDate && item.startDate > now
        );
        setNextEvent(futureEvent || null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextEvent, sortedItems]);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredItems(sortedItems);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = sortedItems.filter((item) => {
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowercasedQuery)
        );
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, sortedItems]);

  const handleItemPress = (item: TripItem) => {
    router.push({
      pathname: '/modal',
      params: { ...item, tripId: item.tripId } as any,
    });
  };

  const currentTrip = trips.find(trip => trip.tripId === currentTripId);

  if (loading || loadingTripId) {
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
      </Center>
    );
  }

  if (!user && !loading) {
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Text>Please log in to view your trips.</Text>
      </Center>
    );
  }

  if (trips.length === 0) {
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900 px-4">
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          No trips found. Please create a new trip in the Profile section.
        </Text>
      </Center>
    );
  }

  if (!currentTripId && trips.length > 0) {
    // Automatically select the first trip if none is selected
    setCurrentTripId(trips[0].tripId!);
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <ScrollView className="bg-gray-50 dark:bg-gray-900">
      {countdown && (
        <Box className="bg-primary-100 p-4 dark:bg-primary-900 flex items-center">
          <Text className="text-primary-800 dark:text-primary-200">
            El proximo evento es en {countdown.days}d {countdown.hours}h{' '}
            {countdown.minutes}m {countdown.seconds}s
          </Text>
        </Box>
      )}
      <Box className="bg-white px-4 py-2 dark:bg-gray-800">
        <Select
          selectedValue={currentTripId || undefined}
          onValueChange={(value) => setCurrentTripId(value)}
        >
          <SelectTrigger>
            <SelectInput placeholder="Select a trip" value={currentTrip?.name || 'Select a Trip'} />
            <SelectIcon className="mr-2">
              <ChevronDownIcon />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.tripId} label={trip.name} value={trip.tripId!} />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
        <Input className="mt-2">
          <InputField
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Input>
      </Box>
      {filteredItems.length === 0 && searchQuery !== '' ? (
        <View className="flex-1 items-center justify-center mt-10">
          <Text className="text-gray-500 dark:text-gray-400">
            No se encontraron elementos que coincidan con la búsqueda.
          </Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-10">
          <Text className="text-gray-500 dark:text-gray-400">
            No hay elementos en este viaje. Agrega uno nuevo desde la vista de tu viaje.
          </Text>
        </View>
      ) : (
        filteredItems.map((item) => (
          <TripListItem
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            participants={participants}
          />
        ))
      )}
    </ScrollView>
  );
}



