import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { TripsProvider } from '@/hooks/useTrips';

SplashScreen.preventAutoHideAsync();

function Layout() {
  const colorScheme = useColorScheme();
  const { user, loading: authLoading } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (!fontsLoaded || authLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/trip');
    }
    SplashScreen.hideAsync();
  }, [user, authLoading, fontsLoaded, segments, router]);

  if (!fontsLoaded || authLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: true }} />
        <Stack.Screen
          name="modal"
          options={() => ({
            presentation: 'modal',
            headerShown: false,
          })}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GluestackUIProvider>
      <AuthProvider>
        <TripsProvider>
          <Layout />
        </TripsProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
