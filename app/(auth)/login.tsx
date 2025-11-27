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
    <Center className="flex-1 bg-background">
      <Box className="p-4 w-full max-w-md">
        <Heading className="text-2xl font-bold">
          Bienvenido
        </Heading>
        <Heading className="mt-2 text-gray-500 font-medium text-base">
          Inicia sesión para continuar
        </Heading>

        <VStack className="space-y-5 mt-8">
          <FormControl>
            <FormControlLabel>
              <Text>Email</Text>
            </FormControlLabel>
            <Input>
              <InputField
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
              <Text>Contraseña</Text>
            </FormControlLabel>
            <Input>
              <InputField
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </Input>
          </FormControl>
          <Button onPress={handleLogin} className="mt-5">
            <ButtonText>Iniciar Sesión</ButtonText>
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
