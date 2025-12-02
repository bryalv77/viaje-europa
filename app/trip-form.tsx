import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTrips } from '@/hooks/useTrips';
import { getTrip, addTrip, updateTrip } from '@/api/firebase';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Textarea, TextareaInput } from '@/components/ui/textarea';

export default function TripFormModal() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { user } = useAuth();
  const { refetch } = useTrips();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditMode = !!tripId;

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getTrip(tripId).then(trip => {
        if (trip) {
          setName(trip.name);
          setDescription(trip.description);
        }
        setLoading(false);
      });
    }
  }, [tripId, isEditMode]);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to manage trips.');
      return;
    }
    if (!name) {
      Alert.alert('Error', 'Trip name is required.');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updateTrip(tripId, { name, description });
      } else {
        await addTrip(user.uid, { name, description });
      }
      refetch();
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner />
      </View>
    );
  }

  return (
    <Box className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
      <VStack space="lg">
        <Heading>{isEditMode ? 'Edit Trip' : 'Add New Trip'}</Heading>
        <VStack space="xs">
          <Text>Trip Name</Text>
          <Input>
            <InputField
              value={name}
              onChangeText={setName}
              placeholder="e.g., Summer in Europe"
            />
          </Input>
        </VStack>
        <VStack space="xs">
          <Text>Description</Text>
          <Textarea>
            <TextareaInput
                value={description}
                onChangeText={setDescription}
                placeholder="A short description of the trip"
            />
            </Textarea>
        </VStack>
        <Button onPress={handleSubmit} disabled={loading}>
          <ButtonText>{loading ? 'Saving...' : 'Save'}</ButtonText>
        </Button>
        <Button variant="outline" onPress={() => router.back()} disabled={loading}>
          <ButtonText>Cancel</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
