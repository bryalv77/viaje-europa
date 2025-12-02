import React, { useEffect } from 'react';
import { Link, Tabs, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import {
  Plane,
  Map,
  User,
  Sun,
  Moon,
  Plus,
  LogOut
} from 'lucide-react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { Pressable, View } from 'react-native';

function TabBarIcon({
  Icon,
  color
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}) {
  return (
    <View style={{ marginBottom: -3 }}>
      <Icon size={28} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { logout } = useAuth();
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="trip"
        options={{
          title: 'Viaje',
          tabBarIcon: ({ color }) => <TabBarIcon Icon={Plane} color={color} />,
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 15,
              }}
            >
              <Pressable onPress={toggleColorScheme} style={{ marginRight: 20 }}>
                {({ pressed }) => (
                  colorScheme === 'dark' ? (
                    <Sun
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  ) : (
                    <Moon
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )
                )}
              </Pressable>
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Plus
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <TabBarIcon Icon={Map} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon Icon={User} color={color} />,
          headerLeft: () => (
            <Pressable
              onPress={async () => {
                await logout();
                router.replace('/(auth)/login');
              }}
            >
              {({ pressed }) => (
                <LogOut
                  size={25}
                  color={Colors[colorScheme ?? 'light'].text}
                  className={`ml-4 ${pressed ? 'opacity-50' : 'opacity-100'}`}
                />
              )}
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
