import { useEffect, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { TripItem } from '@/types';
import { getTripItems } from '@/api/firebase';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Input, InputField } from '@/components/ui/input';
import TripListItem from '@/components/TripListItem';

export default function TripScreen() {
  const [items, setItems] = useState<TripItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
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
    const unsubscribe = getTripItems((newItems) => {
      const sortedItems = newItems.sort(
        (a, b) =>
          new Date(`${a['initial_date']} ${a.initial_time}`).getTime() -
          new Date(`${b['initial_date']} ${b.initial_time}`).getTime()
      );
      setItems(sortedItems);

      const now = new Date();
      const futureEvent = sortedItems.find(
        (item) => new Date(`${item['initial_date']} ${item.initial_time}`) > now
      );
      setNextEvent(futureEvent || null);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!nextEvent) {
      setCountdown(null);
      return;
    }

    const calculateCountdown = () => {
      const eventDate = new Date(`${nextEvent['initial_date']} ${nextEvent.initial_time}`);
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown(null);
        const now = new Date();
        const futureEvent = items.find(
          (item) => new Date(`${item['initial_date']} ${item.initial_time}`) > now
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
  }, [nextEvent, items]);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredItems(items);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = items.filter((item) => {
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowercasedQuery)
        );
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const handleItemPress = (item: TripItem) => {
    router.push({
      pathname: '/modal',
      params: { ...item } as any,
    });
  };

  const renderItem = ({ item }: { item: TripItem }) => (
    <TripListItem item={item} onPress={() => handleItemPress(item)} />
  );

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
      {
        filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-gray-500 dark:text-gray-400">
              No se encontraron elementos.
            </Text>
          </View>
        ) : filteredItems.map((item => (
          <TripListItem key={item.id} item={item} onPress={() => handleItemPress(item)} />
        ) ))
      }
    </ScrollView>
  );
}
