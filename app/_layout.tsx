import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { TripsProvider } from '@/hooks/useTrips';

SplashScreen.preventAutoHideAsync();

function Layout() {
  const colorScheme = useColorScheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)/trip');
    }
    SplashScreen.hideAsync();
  }, [user, authLoading, router]);

  if (authLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
