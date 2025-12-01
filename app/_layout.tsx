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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
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
    // Wait until both auth state and fonts are loaded.
    if (!fontsLoaded || authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // User is not authenticated and not in the auth group, redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is authenticated and in the auth group (e.g., just logged in), redirect to app's main screen
      router.replace('/(tabs)/trip');
    }

    // Hide the splash screen now that we are ready to render.
    SplashScreen.hideAsync();
  }, [user, authLoading, fontsLoaded, segments, router]);

  // Prevent rendering until fonts are loaded and auth state is determined.
  if (!fontsLoaded || authLoading) {
    return null;
  }

  return (
    <GluestackUIProvider>
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
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
