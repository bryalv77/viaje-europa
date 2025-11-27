import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView } from 'react-native';

import { Text } from '@/components/Themed';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { TripItem } from '@/types';
import { useState } from 'react';
import { addTripItem, updateTripItem, deleteTripItem } from '@/api/firebase';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { FormControl, FormControlLabel } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';

export default function ModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEdit = params.id ? true : false;
  const [formState, setFormState] = useState<Partial<TripItem>>(
    isEdit ? params : {}
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleChange = (key: keyof TripItem, value: string) => {
    setFormState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (isEdit) {
      await updateTripItem(formState as TripItem);
    } else {
      await addTripItem(formState as Omit<TripItem, 'id'>);
    }
    router.back();
  };

  const handleDelete = async () => {
    if (params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      await deleteTripItem(id);
    }
    router.back();
  };

  return (
    <ScrollView>
      <VStack className="p-4 space-y-4">
        <Heading className="text-xl font-bold">
          {isEdit ? 'Editar Evento' : 'Añadir Evento'}
        </Heading>
        {Object.keys(formState).map((key) => (
          <FormControl key={key}>
            <FormControlLabel>
              <Text>{key}</Text>
            </FormControlLabel>
            <Input>
              <InputField
                value={String(formState[key as keyof TripItem] || '')}
                onChangeText={(value) =>
                  handleChange(key as keyof TripItem, value)
                }
              />
            </Input>
          </FormControl>
        ))}

        <Button onPress={handleSave}>
          <ButtonText>{isEdit ? 'Guardar Cambios' : 'Añadir'}</ButtonText>
        </Button>
        {isEdit && (
          <Button
            className="bg-red-500"
            onPress={() => setShowDeleteDialog(true)}
          >
            <ButtonText>Eliminar</ButtonText>
          </Button>
        )}

        <AlertDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        >
          <AlertDialogBackdrop />
          <AlertDialogContent>
            <AlertDialogHeader>
              <Heading>Eliminar Evento</Heading>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text>
                ¿Estás seguro de que quieres eliminar este evento? Esta acción
                es irreversible.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowDeleteDialog(false)}
              >
                <ButtonText>Cancelar</ButtonText>
              </Button>
              <Button action="negative" onPress={handleDelete}>
                <ButtonText>Eliminar</ButtonText>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Use a light status bar on iOS to account for the black background */}
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </VStack>
    </ScrollView>
  );
}