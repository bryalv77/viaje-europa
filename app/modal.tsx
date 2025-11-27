import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TripItem } from '@/types';
import { useState } from 'react';
import { addTripItem, updateTripItem, deleteTripItem } from '@/api/firebase';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { FormControl, FormControlLabel } from '@/components/ui/form-control';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';


const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <VStack className="space-y-4">
    <Heading className="text-lg font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
      {title}
    </Heading>
    {children}
  </VStack>
);

const FormInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}> = ({ label, value, onChangeText }) => (
  <FormControl>
    <FormControlLabel>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
    </FormControlLabel>
    <Input>
      <InputField
        className="rounded-lg bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-3"
        value={value}
        onChangeText={onChangeText}
      />
    </Input>
  </FormControl>
);

export default function ModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEdit = params.id ? true : false;

  const [formState, setFormState] = useState<Partial<TripItem>>(
    isEdit ? (params as unknown as TripItem) : {}
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleChange = (key: keyof TripItem, value: string) => {
    setFormState((prevState) => ({ ...prevState, [key]: value }));
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
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (id) {
      await deleteTripItem(id);
    }
    router.back();
  };

  return (
    <ScrollView className="bg-gray-50 dark:bg-gray-900">
      <VStack className="p-6 space-y-8">
        <Heading className="text-2xl font-bold text-center">
          {isEdit ? 'Editar Evento' : 'Añadir Evento'}
        </Heading>

        <FormSection title="General">
          <FormInput
            label="Tipo"
            value={formState.Tipo || ''}
            onChangeText={(v) => handleChange('Tipo', v)}
          />
          <FormInput
            label="Descripción"
            value={formState.Descripción || ''}
            onChangeText={(v) => handleChange('Descripción', v)}
          />
          <FormInput
            label="Persona"
            value={formState.Persona || ''}
            onChangeText={(v) => handleChange('Persona', v)}
          />
        </FormSection>

        <FormSection title="Fechas y Horas">
          <FormInput
            label="Fecha Inicio"
            value={formState['F Inicio'] || ''}
            onChangeText={(v) => handleChange('F Inicio', v)}
          />
          <FormInput
            label="Hora Inicio"
            value={formState.Inicio || ''}
            onChangeText={(v) => handleChange('Inicio', v)}
          />
          <FormInput
            label="Fecha Fin"
            value={formState['F Fin'] || ''}
            onChangeText={(v) => handleChange('F Fin', v)}
          />
          <FormInput
            label="Hora Fin"
            value={formState.Fin || ''}
            onChangeText={(v) => handleChange('Fin', v)}
          />
        </FormSection>
        
        <FormSection title="Ubicación">
            <FormInput label="Lugar Inicio" value={formState["L Inicio"] || ""} onChangeText={(v) => handleChange("L Inicio", v)} />
            <FormInput label="Lugar Fin" value={formState["L Fin"] || ""} onChangeText={(v) => handleChange("L Fin", v)} />
            <FormInput label="Localización (URL)" value={formState.Localizacion || ""} onChangeText={(v) => handleChange("Localizacion", v)} />
        </FormSection>

        <Box className="mt-8">
          <Button onPress={handleSave} className="bg-primary-500 rounded-full">
            <ButtonText className="text-white font-bold py-2">
              {isEdit ? 'Guardar Cambios' : 'Añadir Evento'}
            </ButtonText>
          </Button>

          {isEdit && (
            <Button
              variant="link"
              onPress={() => setShowDeleteDialog(true)}
              className="mt-4"
            >
              <ButtonText className="text-red-500">Eliminar Evento</ButtonText>
            </Button>
          )}
        </Box>

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
                onPress={() => setShowDeleteDialog(false)}
                className="mr-2"
              >
                <ButtonText>Cancelar</ButtonText>
              </Button>
              <Button className="bg-red-600" onPress={handleDelete}>
                <ButtonText>Eliminar</ButtonText>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </VStack>
    </ScrollView>
  );
}