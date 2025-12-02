import React, { useEffect, useState } from 'react';
import { View, Alert, Modal, Dimensions, TouchableOpacity, Platform, ScrollView, Linking } from 'react-native';
import { TripItem } from '@/types';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import {
  Eye,
  MapPin,
  ExternalLink,
  Plane,
  Train,
  Bed,
  Ticket,
  Info
} from 'lucide-react-native';
import { useTrips } from '@/hooks/useTrips';

const { width, height } = Dimensions.get('window');

const getIconForType = (type: string) => {
  switch (type) {
    case 'Vuelo':
      return Plane;
    case 'Tren':
      return Train;
    case 'Hotel':
      return Bed;
    case 'Actividad':
      return Ticket;
    default:
      return Info;
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case 'Vuelo':
      return '#ef4444';
    case 'Tren':
      return '#3b82f6';
    case 'Hotel':
      return '#22c55e';
    case 'Actividad':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};

const parseGeolocation = (geolocatition?: string): { latitude: number; longitude: number } | null => {
  if (!geolocatition) return null;

  try {
    // Try to parse as JSON array [lat, lng] or {lat: x, lng: y}
    const parsed = JSON.parse(geolocatition);
    if (Array.isArray(parsed) && parsed.length >= 2) {
      return { latitude: parsed[0], longitude: parsed[1] };
    } else if (parsed.latitude && parsed.longitude) {
      return { latitude: parsed.latitude, longitude: parsed.longitude };
    } else if (parsed.lat && parsed.lng) {
      return { latitude: parsed.lat, longitude: parsed.lng };
    }
  } catch (e) {
    // If JSON parsing fails, try to extract coordinates from string like "lat,lng"
    const coords = geolocatition.split(',').map(s => parseFloat(s.trim()));
    if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return { latitude: coords[0], longitude: coords[1] };
    }
  }

  return null;
};

const createGoogleMapsUrl = (coords: { latitude: number; longitude: number }) => {
  return `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
};

interface MapMarker {
  id: string;
  coordinates: { latitude: number; longitude: number };
  title: string;
  description?: string;
  type: string;
  location?: string;
  item: TripItem;
}

export default function MapScreen() {
  const { tripItems, loading } = useTrips();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showCallout, setShowCallout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (tripItems) {
      // Process items into markers
      const itemsWithCoords = tripItems
        .map(item => ({
          ...item,
          coords: parseGeolocation(item.geolocatition)
        }))
        .filter(item => item.coords);

      const mapMarkers: MapMarker[] = itemsWithCoords.map(item => ({
        id: item.id,
        coordinates: item.coords!,
        title: item.description,
        description: `${item.type} • ${item['initial_date']}`,
        type: item.type,
        location: item['initial_place'],
        item: item
      }));

      setMarkers(mapMarkers);
    }
  }, [tripItems]);

  const handleMarkerPress = (marker: MapMarker) => {
    setSelectedMarker(marker);
    setShowCallout(true);
  };

  const handleViewDetails = () => {
    if (selectedMarker) {
      router.push({
        pathname: '/modal',
        params: { ...selectedMarker.item, tripId: selectedMarker.item.tripId } as any,
      });
      setShowCallout(false);
      setSelectedMarker(null);
    }
  };

  const renderCallout = () => {
    if (!selectedMarker) return null;

    return (
      <Modal
        visible={showCallout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCallout(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
            onPress={() => setShowCallout(false)}
          />
          <Box className="w-80 max-w-90% bg-white dark:bg-gray-800 rounded-lg p-4 m-4">
            <VStack space="sm">
              <Text className="font-bold text-base">{selectedMarker.title}</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {selectedMarker.description}
              </Text>
              {selectedMarker.location && (
                <Text className="text-sm text-gray-500 dark:text-gray-300">
                  📍 {selectedMarker.location}
                </Text>
              )}
              <HStack className="mt-3 justify-end" space="md">
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setShowCallout(false)}
                >
                  <ButtonText>Cerrar</ButtonText>
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  onPress={handleViewDetails}
                >
                  <Eye size={14} color="white" />
                  <ButtonText className="ml-2">Ver Detalles</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">
          Cargando mapa del viaje...
        </Text>
      </Center>
    );
  }

  if (markers.length === 0) {
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Box className="p-8">
          <MapPin size={48} color="#0ea5e9" />
          <Text className="text-xl font-bold mt-4 mb-2 text-center">
            Sin ubicaciones GPS
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            No se encontraron coordenadas GPS para los viajes.
            Asegúrate de agregar datos de geolocalización a tus viajes.
          </Text>
        </Box>
      </Center>
    );
  }

  const renderLocationCard = (item: TripItem, coords: { latitude: number; longitude: number }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleMarkerPress({
        id: item.id,
        coordinates: coords,
        title: item.description,
        description: `${item.type} • ${item['initial_date']}`,
        type: item.type,
        location: item.initial_place,
        item
      })}
      className="mb-3 mx-4"
    >
      <Box className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <HStack className="items-start space-3">
          <View style={{
            backgroundColor: getColorForType(item.type),
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {React.createElement(getIconForType(item.type), {
              size: 20,
              color: "white"
            })}
          </View>

          <VStack className="flex-1">
            <Text className="font-bold text-base">{item.description}</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {item.type} • {item['initial_date']}
            </Text>
            {item.initial_place && (
              <Text className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                📍 {item.initial_place}
              </Text>
            )}
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              🌐 {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
            </Text>
          </VStack>

          <VStack space="sm">
            <TouchableOpacity
              onPress={() => Linking.openURL(createGoogleMapsUrl(coords))}
              className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full"
            >
              <ExternalLink size={14} color="#2563eb" />
            </TouchableOpacity>
            {item.maps_url && (
              <TouchableOpacity
                onPress={() => Linking.openURL(item.maps_url)}
                className="p-2 bg-green-100 dark:bg-green-900 rounded-full"
              >
                <MapPin size={14} color="#22c55e" />
              </TouchableOpacity>
            )}
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
  
  const itemsWithCoords = tripItems
  .map(item => ({
    ...item,
    coords: parseGeolocation(item.geolocatition)
  }))
  .filter(item => item.coords);

  if (itemsWithCoords.length === 0) {
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Box className="p-8">
          <MapPin size={48} color="#0ea5e9" />
          <Text className="text-xl font-bold mt-4 mb-2 text-center">
            Sin ubicaciones GPS
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            No se encontraron coordenadas GPS para los viajes.
            Asegúrate de agregar datos de geolocalización a tus viajes.
          </Text>
        </Box>
      </Center>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Box className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-lg font-bold text-center">
          🗺️ Mapa del Viaje - {itemsWithCoords.length} Ubicaciones
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
          Toca para ver detalles • Botones para abrir en Google Maps
        </Text>
      </Box>

      {/* Location List */}
      <ScrollView className="flex-1">
        {itemsWithCoords.map(item =>
          renderLocationCard(item, item.coords!)
        )}
      </ScrollView>

      {/* Legend */}
      <View className="bg-white dark:bg-gray-800 rounded-lg p-3 mx-4 mb-4 shadow-lg">
        <Text className="font-bold text-sm mb-2">🎨 Leyenda</Text>
        <VStack space="sm">
          <HStack className="items-center">
            <View style={{
              backgroundColor: '#ef4444',
              width: 20,
              height: 20,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Plane size={10} color="white" />
            </View>
            <Text className="ml-2 text-sm">Vuelo</Text>
          </HStack>
          <HStack className="items-center">
            <View style={{
              backgroundColor: '#22c55e',
              width: 20,
              height: 20,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Bed size={10} color="white" />
            </View>
            <Text className="ml-2 text-sm">Hotel</Text>
          </HStack>
          <HStack className="items-center">
            <View style={{
              backgroundColor: '#3b82f6',
              width: 20,
              height: 20,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Train size={10} color="white" />
            </View>
            <Text className="ml-2 text-sm">Tren</Text>
          </HStack>
          <HStack className="items-center">
            <View style={{
              backgroundColor: '#6b7280',
              width: 20,
              height: 20,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ticket size={10} color="white" />
            </View>
            <Text className="ml-2 text-sm">Actividad</Text>
          </HStack>
        </VStack>
      </View>

      {renderCallout()}
    </View>
  );
}