import React, { useState } from 'react';
import { ScrollView, Linking, TouchableOpacity, View } from 'react-native';
import { useTrips } from '@/hooks/useTrips';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ExternalLink, ArrowRight } from 'lucide-react-native';
import { TripItem } from '@/types';

const parseDateTime = (dateStr: string, timeStr: string): Date => {
    if (!dateStr || !timeStr) {
        // Return a date that will be sorted last
        return new Date(8640000000000000);
    }
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    // JavaScript's month is 0-indexed (0 for January, 11 for December)
    return new Date(year, month - 1, day, hours, minutes);
};

const Cell = ({ children, isHeader }: { children: React.ReactNode, isHeader?: boolean }) => (
    <Box style={{ width: 120, flexShrink: 0, padding: 8, borderBottomWidth: 1, borderColor: '#e5e7eb' }}>
        <Text isTruncated={false} className={isHeader ? 'font-bold' : ''}>{children}</Text>
    </Box>
);

export default function SummaryScreen() {
  const { tripItems, loading } = useTrips();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <Center className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">Cargando resumen...</Text>
      </Center>
    );
  }

  const headers = [
    'F Inicio', 'Inicio', 'F Fin', 'Fin', 'L Inicio', 'L Fin', 'Tipo', 'Descripción', 
    'Persona', 'Información', 'Localizacion', 'Vuelo', 'Reserva', 'Mano', 
    'Equipaje', 'File', 'Precio', 'Pagado', 'Precio Cecy', 'Pagado Cecy'
  ];

  const filteredAndSortedItems = tripItems
    .filter(item => {
      const searchTermLower = searchTerm.toLowerCase();
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTermLower);
        }
        if (Array.isArray(value)) {
          return value.join(', ').toLowerCase().includes(searchTermLower);
        }
        return false;
      });
    })
    .sort((a, b) => {
      const dateA = parseDateTime(a.initial_date, a.initial_time);
      const dateB = parseDateTime(b.initial_date, b.initial_time);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <View style={{ flex: 1 }}>
        <Box className="p-4 bg-white dark:bg-gray-800">
            <Input className="mt-4">
            <InputField
                placeholder="Buscar..."
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            </Input>
            <View className="flex-row items-center justify-center mt-2">
                <Text className="text-xs text-gray-500">Desliza para ver más columnas</Text>
                <ArrowRight size={14} color="#6b7280" style={{ marginLeft: 5 }} />
            </View>
        </Box>
        <ScrollView>
            <ScrollView horizontal>
                <VStack>
                    <HStack>
                        {headers.map(header => (
                            <Cell key={header} isHeader>{header}</Cell>
                        ))}
                    </HStack>
                    {filteredAndSortedItems.map(item => (
                        <HStack key={item.id}>
                            <Cell>{item.initial_date}</Cell>
                            <Cell>{item.initial_time}</Cell>
                            <Cell>{item.end_date}</Cell>
                            <Cell>{item.end_time}</Cell>
                            <Cell>{item.initial_place}</Cell>
                            <Cell>{item.final_place}</Cell>
                            <Cell>{item.type}</Cell>
                            <Cell>{item.description}</Cell>
                            <Cell>{item.participants.join(', ')}</Cell>
                            <Cell>{item.info}</Cell>
                            <Cell>{item.geolocation}</Cell>
                            <Cell>{item.flight}</Cell>
                            <Cell>{item.reservation}</Cell>
                            <Cell>{item.hand_equipment}</Cell>
                            <Cell>{item.facturation_equipment}</Cell>
                            <Cell>
                                {item.file ? (
                                    <TouchableOpacity onPress={() => Linking.openURL(item.file)}>
                                    <ExternalLink size={18} color="#3b82f6" />
                                    </TouchableOpacity>
                                ) : null}
                            </Cell>
                            <Cell>{item.price}</Cell>
                            <Cell>{item.payed_price}</Cell>
                            <Cell>{item.price_cecy}</Cell>
                            <Cell>{item.payed_price_cecy}</Cell>
                        </HStack>
                    ))}
                </VStack>
            </ScrollView>
        </ScrollView>
    </View>
  );
}