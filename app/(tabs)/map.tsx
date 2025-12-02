import React, { useEffect, useState, useRef } from 'react';
import { View, Modal, Dimensions, TouchableOpacity, useColorScheme, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { TripItem } from '@/types';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Eye, MapPin, Plane, Train, Bed, Ticket, Info, X } from 'lucide-react-native';
import { useTrips } from '@/hooks/useTrips';
import { mapStyle } from '@/constants/mapStyle';

const getIconForType = (type: string) => {
  switch (type) {
    case 'Vuelo':
    case 'flight':
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
    case 'flight':
      return '#ef4444'; // red-500
    case 'Tren':
      return '#3b82f6'; // blue-500
    case 'Hotel':
      return '#22c55e'; // green-500
    case 'Actividad':
      return '#6b7280'; // gray-500
    default:
      return '#6b7280'; // gray-500
  }
};

const parseGeolocation = (geolocation?: string): { latitude: number; longitude: number } | null => {
  if (!geolocation) return null;

  const coords = geolocation.split(',').map(s => parseFloat(s.trim()));
  if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    return { latitude: coords[0], longitude: coords[1] };
  }

  return null;
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
  const [initialRegion, setInitialRegion] = useState<any>(null);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (tripItems) {
      const itemsWithCoords = tripItems
        .map(item => ({
          ...item,
          coords: parseGeolocation(item.geolocation),
        }))
        .filter(item => item.coords);

      const mapMarkers: MapMarker[] = itemsWithCoords.map(item => ({
        id: item.id,
        coordinates: item.coords!,
        title: item.description,
        description: `${item.type} • ${item['initial_date']}`,
        type: item.type,
        location: item['initial_place'],
        item: item,
      }));

      setMarkers(mapMarkers);

      if (mapMarkers.length > 0) {
        const latitudes = mapMarkers.map(m => m.coordinates.latitude);
        const longitudes = mapMarkers.map(m => m.coordinates.longitude);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const region = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.5 || 0.02,
          longitudeDelta: (maxLng - minLng) * 1.5 || 0.02,
        };
        setInitialRegion(region);
      }
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
        <View className="flex-1 justify-center items-center bg-black/50">
          <TouchableOpacity className="absolute top-0 left-0 right-0 bottom-0" onPress={() => setShowCallout(false)} />
          <Box className="w-80 max-w-[90%] bg-white dark:bg-gray-800 rounded-lg p-4 m-4">
            <TouchableOpacity
              onPress={() => setShowCallout(false)}
              className="absolute top-2.5 right-2.5 p-1.5 z-10"
            >
              <X size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
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
                {selectedMarker.item.file && (
                  <Button size="sm" variant="outline" onPress={() => Linking.openURL(selectedMarker.item.file!)}>
                    <ButtonText>Abrir Archivo</ButtonText>
                  </Button>
                )}
                <Button size="sm" variant="solid" onPress={handleViewDetails}>
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
        <Text className="mt-4 text-gray-600 dark:text-gray-400">Cargando mapa del viaje...</Text>
      </Center>
    );
  }

  if (markers.length === 0) {
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Box className="p-8 items-center">
          <MapPin size={48} color="#0ea5e9" />
          <Text className="text-xl font-bold mt-4 mb-2 text-center">Sin ubicaciones GPS</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            No se encontraron coordenadas GPS para los viajes. Asegúrate de agregar datos de geolocalización a tus viajes.
          </Text>
        </Box>
      </Center>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height}}
        className="w-full h-full"
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        customMapStyle={colorScheme === 'dark' ? mapStyle : []}
        showsUserLocation
        showsMyLocationButton
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinates}
            onPress={() => handleMarkerPress(marker)}
            tracksViewChanges={false} // Performance optimization
          >
            <View className="w-8 h-8 rounded-full justify-center items-center border-2 border-white shadow-lg" style={{ backgroundColor: getColorForType(marker.type) }}>
              {React.createElement(getIconForType(marker.type), { size: 16, color: 'white' })}
            </View>
          </Marker>
        ))}
      </MapView>
      <View className="absolute bottom-5 left-5 p-2.5 rounded-lg shadow-lg bg-white/90 dark:bg-gray-800/90">
        <Text className="font-bold text-sm mb-2 dark:text-white">🎨 Leyenda</Text>
        <VStack space="sm">
          <HStack className="items-center">
            <View className="w-5 h-5 rounded-full justify-center items-center" style={{ backgroundColor: '#ef4444' }}>
              <Plane size={10} color="white" />
            </View>
            <Text className="ml-2 text-sm dark:text-gray-200">Vuelo</Text>
          </HStack>
          <HStack className="items-center">
            <View className="w-5 h-5 rounded-full justify-center items-center" style={{ backgroundColor: '#22c55e' }}>
              <Bed size={10} color="white" />
            </View>
            <Text className="ml-2 text-sm dark:text-gray-200">Hotel</Text>
          </HStack>
          <HStack className="items-center">
            <View className="w-5 h-5 rounded-full justify-center items-center" style={{ backgroundColor: '#3b82f6' }}>
              <Train size={10} color="white" />
            </View>
            <Text className="ml-2 text-sm dark:text-gray-200">Tren</Text>
          </HStack>
          <HStack className="items-center">
            <View className="w-5 h-5 rounded-full justify-center items-center" style={{ backgroundColor: '#6b7280' }}>
              <Ticket size={10} color="white" />
            </View>
            <Text className="ml-2 text-sm dark:text-gray-200">Actividad</Text>
          </HStack>
        </VStack>
      </View>
      {renderCallout()}
    </View>
  );
}