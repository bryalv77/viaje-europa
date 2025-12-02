import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';

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

  const content = (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Center className="flex-1">
          <Box className="p-8 w-full max-w-md py-12">
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
      </ScrollView>
    </TouchableWithoutFeedback>
  );

  if (Platform.OS === 'web') {
    return <View className="flex-1 bg-gray-50 dark:bg-gray-900">{content}</View>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
    >
      {content}
    </KeyboardAvoidingView>
  );
}
