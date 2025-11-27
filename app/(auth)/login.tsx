import React, { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { Center } from '@/components/ui/center';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { FormControl, FormControlLabel } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Box className="p-8 w-full max-w-md">
        <Heading className="text-3xl font-bold text-center">
          Bienvenido
        </Heading>
        <Heading className="mt-2 text-gray-500 font-medium text-center text-base">
          Inicia sesión para planificar tu viaje
        </Heading>

        <VStack className="space-y-6 mt-10">
          <FormControl>
            <FormControlLabel>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Text>
            </FormControlLabel>
            <Input>
              <InputField
                className="rounded-lg bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Input>
          </FormControl>
          <FormControl>
            <FormControlLabel>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </Text>
            </FormControlLabel>
            <Input>
              <InputField
                className="rounded-lg bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4"
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </Input>
          </FormControl>
          <Button
            onPress={handleLogin}
            className="mt-6 bg-primary-500 rounded-full"
          >
            <ButtonText className="text-white font-bold py-2">
              Iniciar Sesión
            </ButtonText>
          </Button>
        </VStack>
      </Box>

      {error && (
        <AlertDialog isOpen={!!error} onClose={() => setError(null)}>
          <AlertDialogBackdrop />
          <AlertDialogContent>
            <AlertDialogHeader>
              <Heading>Error de Autenticación</Heading>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text>{error}</Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onPress={() => setError(null)}>
                <ButtonText>OK</ButtonText>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Center>
  );
}
