import React from 'react';
import { Center } from '@/components/ui/center';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function MapScreen() {
  return (
    <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Box className="p-8">
        <FontAwesome name="map" size={48} color="#0ea5e9" />
        <Heading className="text-xl font-bold mt-4 mb-2">Mapa del Viaje</Heading>
        <Text className="text-gray-600 dark:text-gray-400 text-center">
          Aquí podrás ver todos los lugares de tu viaje en un mapa interactivo
        </Text>
      </Box>
    </Center>
  );
}