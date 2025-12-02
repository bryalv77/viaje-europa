import React from 'react';
import { Linking, Pressable, View } from 'react-native';
import { ParticipantObject, TripItem } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Link } from 'expo-router';

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
    console.log(`Don't know how to open this URL: ${url}`);
  }
};

interface TripListItemProps {
  item: TripItem;
  participants: ParticipantObject;
  onPress: () => void;
}

export default function TripListItem({ item, participants, onPress }: TripListItemProps) {
  return (
    <View>
      <Box className="m-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <VStack space="md">
          <HStack className="items-center">
            <Center className="mr-4 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
              <FontAwesome
                name={getIconForType(item.type)}
                size={24}
                color="teal"
              />
            </Center>
            <VStack className="flex-1">
              <Text className="text-lg font-bold">{item.description}</Text>
              <Text className="text-gray-600 dark:text-gray-400">
                {item['initial_place']} a {item['final_place']}
              </Text>
            </VStack>
            <Pressable onPress={onPress}>
              <FontAwesome name="edit" size={20} color="gray" />
            </Pressable>
          </HStack>

          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            {item['initial_date']} {item.initial_time} - {item['end_date']} {item.end_time}
          </Text>

          {item.participants &&  participants &&(
            <HStack className="mt-2 items-center">
              <FontAwesome name="user" size={16} color="gray" />
              <Text className="ml-2 text-gray-700 dark:text-gray-300">
                {item.participants.map(participantId => participants[participantId]?.name).join(', ')}
              </Text>
            </HStack>
          )}

          {item.info && (
            <HStack className="mt-2 items-start">
              <Pressable onPress={() => handleLink(item.info)}>
                <HStack className="items-start">
                  <FontAwesome
                    name="link"
                    size={16}
                    color="gray"
                    style={{ marginTop: 2 }}
                  />
                  <Text className="ml-2 flex-1 text-gray-700 dark:text-gray-300">
                    {item.info}
                  </Text>
                </HStack>
              </Pressable>
            </HStack>
          )}

          <Divider className="my-2" />

          <HStack className="items-center justify-between">
            {(item.price || item.price_cecy) ? (
              <HStack className="items-center">
                <FontAwesome name="money" size={16} color="green" />
                <Text className="ml-2 font-bold text-green-600 dark:text-green-400">
                  {item.price || item.price_cecy}
                </Text>
              </HStack>
            ): <HStack />}

            <HStack space="md">
              {item.maps_url && (
                <Button
                  size="xs"
                  variant="outline"
                  onPress={() => handleLink(item.maps_url)}
                >
                  <FontAwesome name="map-marker" size={16} />
                  <ButtonText className="ml-2">Mapa</ButtonText>
                </Button>
              )}
              {item.file && (
                <Button
                  size="xs"
                  variant="outline"
                  onPress={() => handleLink(item.file)}
                >
                  <FontAwesome name="file-o" size={16} />
                  <ButtonText className="ml-2">Archivo</ButtonText>
                </Button>
              )}
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </View>
  );
}
