import React from 'react';
import { Center } from '@/components/ui/center';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/hooks/useAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Box className="p-8">
        <FontAwesome name="user" size={48} color="#0ea5e9" />
        <Heading className="text-xl font-bold mt-4 mb-2">Perfil</Heading>
        {user && (
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            {user.email}
          </Text>
        )}
        <Text className="text-gray-500 dark:text-gray-400 text-center mt-4">
          Configuración del perfil y preferencias del viaje
        </Text>
      </Box>
    </Center>
  );
}