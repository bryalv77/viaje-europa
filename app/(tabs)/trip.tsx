import { useEffect, useState } from 'react';
import { FlatList, Linking, Pressable, View } from 'react-native';
import { TripItem } from '@/types';
import { getTripItems } from '@/api/firebase';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';

const getIconForType = (type: string) => {
  switch (type) {
    case 'Vuelo':
      return 'plane';
    case 'Tren':
      return 'train';
    case 'Hotel':
      return 'bed';
    case 'Actividad':
      return 'ticket';
    default:
      return 'info-circle';
  }
};

const handleLink = async (url: string) => {
  if (!url) return;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    // Maybe show an alert to the user
    console.log(`Don't know how to open this URL: ${url}`);
  }
};

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
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = getTripItems((newItems) => {
      const sortedItems = newItems.sort(
        (a, b) =>
          new Date(`${a['F Inicio']}T${a.Inicio}`).getTime() -
          new Date(`${b['F Inicio']}T${b.Inicio}`).getTime()
      );
      setItems(sortedItems);

      const now = new Date();
      const futureEvent = sortedItems.find(
        (item) => new Date(`${item['F Inicio']}T${item.Inicio}`) > now
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
      const eventDate = new Date(`${nextEvent['F Inicio']}T${nextEvent.Inicio}`);
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown(null);
        // Maybe find the *next* next event
        const now = new Date();
        const futureEvent = items.find(
          (item) => new Date(`${item['F Inicio']}T${item.Inicio}`) > now
        );
        setNextEvent(futureEvent || null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      setCountdown({ days, hours, minutes });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000 * 60); // Update every minute

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
    <Pressable onPress={() => handleItemPress(item)}>
      <Box className="m-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <VStack space="md">
          <HStack className="items-center">
            <Center className="mr-4 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
              <FontAwesome
                name={getIconForType(item.Tipo)}
                size={24}
                color="teal"
              />
            </Center>
            <VStack className="flex-1">
              <Text className="text-lg font-bold">{item.Descripción}</Text>
              <Text className="text-gray-600 dark:text-gray-400">
                {item['L Inicio']} a {item['L Fin']}
              </Text>
            </VStack>
          </HStack>

          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            {item['F Inicio']} {item.Inicio} - {item['F Fin']} {item.Fin}
          </Text>

          {item.Persona && (
            <HStack className="mt-2 items-center">
              <FontAwesome name="user" size={16} color="gray" />
              <Text className="ml-2 text-gray-700 dark:text-gray-300">
                {item.Persona}
              </Text>
            </HStack>
          )}

          {item.Información && (
            <HStack className="mt-2 items-start">
              <FontAwesome
                name="info-circle"
                size={16}
                color="gray"
                style={{ marginTop: 2 }}
              />
              <Text className="ml-2 flex-1 text-gray-700 dark:text-gray-300">
                {item.Información}
              </Text>
            </HStack>
          )}

          <Divider className="my-2" />

          <HStack className="items-center justify-between">
            {(item.Precio || item['Precio Cecy']) && (
              <HStack className="items-center">
                <FontAwesome name="money" size={16} color="green" />
                <Text className="ml-2 font-bold text-green-600 dark:text-green-400">
                  {item.Precio || item['Precio Cecy']}
                </Text>
              </HStack>
            )}

            <HStack space="md">
              {item.Localizacion && (
                <Button
                  size="xs"
                  variant="outline"
                  onPress={() => handleLink(item.Localizacion)}
                >
                  <FontAwesome name="map-marker" size={16} />
                  <ButtonText className="ml-2">Location</ButtonText>
                </Button>
              )}
              {item.File && (
                <Button
                  size="xs"
                  variant="outline"
                  onPress={() => handleLink(item.File)}
                >
                  <FontAwesome name="file-o" size={16} />
                  <ButtonText className="ml-2">File</ButtonText>
                </Button>
              )}
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );

  if (loading) {
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {countdown && (
        <Box className="bg-primary-100 p-4 dark:bg-primary-900">
          <Text className="text-center text-primary-800 dark:text-primary-200">
            El proximo evento es en {countdown.days}d {countdown.hours}h{' '}
            {countdown.minutes}m
          </Text>
        </Box>
      )}
      <Box className="bg-white p-4 dark:bg-gray-800">
        <Input>
          <InputField
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Input>
      </Box>
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="py-4"
      />
    </View>
  );
}
