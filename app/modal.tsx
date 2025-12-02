import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Participant, TripItem } from '@/types';
import { useState } from 'react';
import { addTripItem, updateTripItem, deleteTripItem } from '@/api/firebase';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { FormControl, FormControlLabel } from '@/components/ui/form-control';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { HStack } from '@/components/ui/hstack';
import { ChevronLeft } from 'lucide-react-native';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@/components/ui/select';

import { CheckIcon, ChevronDownIcon } from '@/components/ui/icon';
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from '@/components/ui/checkbox';
import { useTrips } from '@/hooks/useTrips';

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
  const { trips } = useTrips();
  const [selectedTrip, setSelectedTrip] = useState<string | undefined>(
    isEdit ? (params.tripId as string) : undefined
  );

  const [participants, setParticipants] = useState<Participant[]>([]);

  const handleChange = (key: keyof TripItem, value: string) => {
    setFormState((prevState) => ({ ...prevState, [key]: value }));
  };

  const handleSave = async () => {
    const tripId = isEdit ? (params.tripId as string) : selectedTrip;
    if (!tripId) {
      // TODO: Show an error to the user to select a trip
      return;
    }
    if (isEdit) {
      await updateTripItem(tripId, formState as TripItem);
    } else {
      await addTripItem(tripId, formState as Omit<TripItem, 'id'>);
    }
    router.back();
  };

  const handleDelete = async () => {
    const tripId = params.tripId as string;
    const itemId = params.id as string;
    if (tripId && itemId) {
      await deleteTripItem(tripId, itemId);
    }
    router.back();
  };

  return (
    <ScrollView className="bg-gray-50 dark:bg-gray-900">
      <VStack className="p-6 space-y-8">
        <HStack className="flex items-center gap-4">
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={16} className="text-primary-500" />
          </Pressable>
          <Heading className="text-2xl font-bold text-center">
            {isEdit ? 'Editar Evento' : 'Añadir Evento'}
          </Heading>
        </HStack>

        <FormSection title="General">
          {!isEdit && (
            <FormControl>
              <FormControlLabel>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Viaje
                </Text>
              </FormControlLabel>
              <Select onValueChange={setSelectedTrip} selectedValue={selectedTrip}>
                <SelectTrigger>
                  <SelectInput placeholder="Selecciona un viaje" />
                  <SelectIcon as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} label={trip.name} value={trip.id!} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>
          )}
          <FormInput
            label="type"
            value={formState.type || ''}
            onChangeText={(v) => handleChange('type', v)}
          />
          <FormInput
            label="Descripción"
            value={formState.description || ''}
            onChangeText={(v) => handleChange('description', v)}
          />

          {participants.map((participant) => (
            <Checkbox
              value={participant.participantId}
              isChecked={formState.participants?.includes(
                participant.participantId
              )}
              size="md"
            >
              {/* <CheckboxIndicator>
                        <CheckboxIcon as={CheckIcon} />
                      </CheckboxIndicator> */}
              <CheckboxLabel>{participant.name}</CheckboxLabel>
            </Checkbox>
          ))}
        </FormSection>

        <FormSection title="Fechas y Horas">
          <FormInput
            label="Fecha Inicio"
            value={formState['initial_date'] || ''}
            onChangeText={(v) => handleChange('initial_date', v)}
          />
          <FormInput
            label="Hora Inicio"
            value={formState.initial_time || ''}
            onChangeText={(v) => handleChange('initial_time', v)}
          />
          <FormInput
            label="Fecha Fin"
            value={formState.end_date || ''}
            onChangeText={(v) => handleChange('end_date', v)}
          />
          <FormInput
            label="Hora Fin"
            value={formState.end_time || ''}
            onChangeText={(v) => handleChange('end_time', v)}
          />
        </FormSection>

        <FormSection title="Ubicación">
          <FormInput
            label="Lugar Inicio"
            value={formState.initial_place || ''}
            onChangeText={(v) => handleChange('initial_place', v)}
          />
          <FormInput
            label="Lugar Fin"
            value={formState.final_place || ''}
            onChangeText={(v) => handleChange('final_place', v)}
          />
          <FormInput
            label="Localización (URL)"
            value={formState.maps_url || ''}
            onChangeText={(v) => handleChange('maps_url', v)}
          />
        </FormSection>

        <Box className="mt-8">
          <Button
            onPress={handleSave}
            className="bg-primary-500 rounded-full"
          >
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
              <ButtonText className="text-red-500">
                Eliminar Evento
              </ButtonText>
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