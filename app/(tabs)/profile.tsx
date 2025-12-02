import React, { useState, useEffect } from 'react';
import { ScrollView, Pressable, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { useTrips } from '@/hooks/useTrips';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { useRouter } from 'expo-router';
import { deleteTrip } from '@/api/firebase';
import { HStack } from '@/components/ui/hstack';

export default function ProfileScreen() {
  const { user, updateUserProfile, updateUserPassword } = useAuth();
  const { trips, currentTripId, setCurrentTripId, refetch, loading: tripsLoading } = useTrips();
  const toast = useToast();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      const [first, ...last] = user.displayName.split(' ');
      setFirstName(first);
      setLastName(last.join(' '));
    }
  }, [user]);

  const handleChoosePhoto = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission required',
        'Permission to access photos is required!'
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (pickerResult.canceled || !user) {
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch(pickerResult.assets[0].uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);
      await updateUserProfile({ photoURL });
      toast.show({
        placement: 'top',
        render: ({ id }: { id: string }) => (
          <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>Profile picture updated!</ToastTitle>
          </Toast>
        ),
      });
    } catch (e: any) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    const displayName = `${firstName} ${lastName}`.trim();
    try {
      await updateUserProfile({ displayName });
      toast.show({
        placement: 'top',
        render: ({ id }: { id: string }) => (
          <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>Profile saved!</ToastTitle>
          </Toast>
        ),
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip and all its data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (user) {
              await deleteTrip(user.uid, tripId);
              refetch();
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters.');
      return;
    }
    try {
      await updateUserPassword(newPassword);
      toast.show({
        placement: 'top',
        render: ({ id }: { id: string }) => (
          <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>Password updated successfully!</ToastTitle>
          </Toast>
        ),
      });
      setNewPassword('');
    } catch (e: any) {
      Alert.alert(
        'Error changing password',
        'This is a sensitive operation. Please log out and log back in before trying again.'
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <VStack space="lg" className="p-8">
        <Heading>My Profile</Heading>

        <Box className="items-center">
          <Pressable onPress={handleChoosePhoto}>
            <Avatar size="2xl">
              <AvatarFallbackText>
                {user?.displayName?.charAt(0)}
              </AvatarFallbackText>
              {user?.photoURL && (
                <AvatarImage source={{ uri: user.photoURL }} />
              )}
            </Avatar>
          </Pressable>
          <Button
            size="sm"
            variant="link"
            onPress={handleChoosePhoto}
            disabled={isUploading}
          >
            <ButtonText>
              {isUploading ? 'Uploading...' : 'Change Photo'}
            </ButtonText>
          </Button>
        </Box>

        <VStack space="md">
          <Text>Email: {user?.email}</Text>
          <VStack space="xs">
            <Text>First Name</Text>
            <Input>
              <InputField
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
              />
            </Input>
          </VStack>
          <VStack space="xs">
            <Text>Last Name</Text>
            <Input>
              <InputField
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
              />
            </Input>
          </VStack>
          <Button onPress={handleSaveProfile}>
            <ButtonText>Save Profile</ButtonText>
          </Button>
        </VStack>

        <VStack space="md" className="mt-8">
          <HStack className="justify-between items-center">
            <Heading size="md">My Trips</Heading>
            <Button size="sm" onPress={() => router.push('/trip-form')}>
              <ButtonText>Add Trip</ButtonText>
            </Button>
          </HStack>
          {tripsLoading ? (
            <Spinner />
          ) : trips.length > 0 ? (
            trips.map((trip) => (
              <Card key={trip.tripId} className="p-4">
                <VStack space="md">
                  <Heading size="sm">{trip.name}</Heading>
                  <Text>{trip.description}</Text>
                  <HStack space="sm" className="mt-2">
                   
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => router.push({ pathname: '/trip-form', params: { tripId: trip.tripId } })}
                    >
                      <ButtonText>Edit</ButtonText>
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      onPress={() => handleDeleteTrip(trip.tripId!)}
                    >
                      <ButtonText className="text-red-500">Delete</ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              </Card>
            ))
          ) : (
            <Text>No trips found.</Text>
          )}
        </VStack>

        <VStack space="md" className="mt-8">
          <Heading size="md">Change Password</Heading>
          <VStack space="xs">
            <Text>New Password</Text>
            <Input>
              <InputField
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                secureTextEntry
              />
            </Input>
          </VStack>
          <Button onPress={handleChangePassword}>
            <ButtonText>Update Password</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}