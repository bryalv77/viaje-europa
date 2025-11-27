import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { Pressable, View } from 'react-native';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="trip"
        options={{
          title: 'Viaje',
          tabBarIcon: ({ color }) => <TabBarIcon name="plane" color={color} />,
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
                  <FontAwesome
                    name={colorScheme === 'dark' ? 'sun-o' : 'moon-o'}
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="plus"
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
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerLeft: () => (
            <Pressable
              onPress={async () => {
                await logout();
                router.replace('/(auth)/login');
              }}
            >
              {({ pressed }) => (
                <FontAwesome
                  name="sign-out"
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
