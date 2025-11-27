import { useEffect, useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import { TripItem } from '@/types';
import { getTripItems } from '@/api/firebase';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';

export default function TripScreen() {
  const [items, setItems] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = getTripItems((newItems) => {
      setItems(newItems);
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
      <Box className="border-b border-border dark:border-borderDark p-4">
        <VStack className="space-y-2">
          <Text className="text-md font-bold">{item.Descripción}</Text>
          <HStack>
            <Text className="font-semibold">De: </Text>
            <Text>
              {item['L Inicio']} ({item['F Inicio']} {item.Inicio})
            </Text>
          </HStack>
          <HStack>
            <Text className="font-semibold">A: </Text>
            <Text>
              {item['L Fin']} ({item['F Fin']} {item.Fin})
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );

  if (loading) {
    return (
      <Center className="flex-1">
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}
