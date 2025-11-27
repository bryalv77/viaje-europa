import { useEffect, useState } from 'react';
import { FlatList, Pressable } from 'react-native';
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

export default function TripScreen() {
  const [items, setItems] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = getTripItems((newItems) => {
      setItems(newItems.sort((a, b) => new Date(a['F Inicio']).getTime() - new Date(b['F Inicio']).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleItemPress = (item: TripItem) => {
    router.push({
      pathname: '/modal',
      params: { ...item } as any,
    });
  };

  const renderItem = ({ item }: { item: TripItem }) => (
    <Pressable onPress={() => handleItemPress(item)}>
      <Box className="bg-white dark:bg-gray-800 rounded-xl p-4 m-4 shadow-sm">
        <HStack className="items-center">
          <Center className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full mr-4">
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
            <Text className="text-sm text-gray-500 dark:text-gray-300 mt-1">
              {item['F Inicio']} {item.Inicio} - {item['F Fin']} {item.Fin}
            </Text>
          </VStack>
        </HStack>
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
    <FlatList
      className="bg-gray-50 dark:bg-gray-900"
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerClassName="py-4"
    />
  );
}
