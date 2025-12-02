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

export default function TripScreen() {
  const { tripItems, participants, loading } = useTrips();
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

  useEffect(() => {
    if (tripItems) {
      const sorted = [...tripItems].sort(
        (a, b) =>
          new Date(`${a['initial_date']} ${a.initial_time}`).getTime() -
          new Date(`${b['initial_date']} ${b.initial_time}`).getTime()
      );
      setSortedItems(sorted);

      const now = new Date();
      const futureEvent = sorted.find(
        (item) => new Date(`${item['initial_date']} ${item.initial_time}`) > now
      );
      setNextEvent(futureEvent || null);
    }
  }, [tripItems]);

  useEffect(() => {
    if (!nextEvent) {
      setCountdown(null);
      return;
    }

    const calculateCountdown = () => {
      const eventDate = new Date(
        `${nextEvent['initial_date']} ${nextEvent.initial_time}`
      );
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown(null);
        const now = new Date();
        const futureEvent = sortedItems.find(
          (item) =>
            new Date(`${item['initial_date']} ${item.initial_time}`) > now
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

  if (loading) {
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
        <Input>
          <InputField
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Input>
      </Box>
      {filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-10">
          <Text className="text-gray-500 dark:text-gray-400">
            No se encontraron elementos.
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



