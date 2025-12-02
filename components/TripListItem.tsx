import React from 'react';
import { Linking, Pressable, View } from 'react-native';
import { ParticipantObject, TripItem } from '@/types';
import {
  Edit,
  User,
  Eye,
  
  MapPin,
  FileText,
  Plane,
  Train,
  Bed,
  Ticket,
  ExternalLink,
  Info,
  DollarSign
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';

const getIconForType = (type: string) => {
  switch (type) {
    case 'Vuelo':
    case 'flight':
      return Plane;
    case 'Tren':
      return Train;
    case 'Hotel':
      return Bed;
    case 'Actividad':
      return Ticket;
    default:
      return Info;
  }
};

const handleLink = async (url: string) => {

  if (!url) return;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
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
              {React.createElement(getIconForType(item.type), {
                size: 24,
                color: "teal"
              })}
            </Center>
            <VStack className="flex-1">
              <Text className="text-lg font-bold">{item.description}</Text>
              <Text className="text-gray-600 dark:text-gray-400">
                {item['initial_place']} a {item['final_place']}
              </Text>
            </VStack>
            <Pressable onPress={onPress}>
              <Edit size={20} className='text-gray-500 dark:text-gray-400' />
            </Pressable>
          </HStack>

          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            {item['initial_date']} {item.initial_time} - {item['end_date']} {item.end_time}
          </Text>

          {item.participants &&  participants &&(
            <HStack className="mt-2 items-center">
              <User size={16} className='text-gray-500 dark:text-gray-400' />
              <Text className="ml-2 text-gray-700 dark:text-gray-300">
                {item.participants.map(participantId => participants[participantId]?.name).join(', ')}
              </Text>
            </HStack>
          )}

          {item.info && (
              <Pressable onPress={() => handleLink(item.info)}>
                <HStack className="items-center gap-2">
                  <ExternalLink size={16} />
                  <Text>{item.info} </Text>
                </HStack>
              </Pressable>
          )}

          <Divider className="my-2" />

          <HStack className="items-center justify-between">
            {(item.price || item.price_cecy) ? (
              <HStack className="items-center">
                <DollarSign size={16} className='text-green-600 dark:text-green-400' />
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
                  <ButtonIcon as={MapPin} />
                  <ButtonText className="ml-2">Mapa</ButtonText>
                </Button>
              )}
              {item.file && (
                <Button
                  size="xs"
                  variant="outline"
                  onPress={() => handleLink(item.file)}
                >
                  <ButtonIcon as={FileText} />
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
