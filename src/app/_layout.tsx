import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider } from '../theme/ThemeContext';
import { RevenueCatProvider } from '../theme/RevenueCatProvider';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '../theme/tokenCache';

import { SafeAreaProvider } from 'react-native-safe-area-context';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!clerkPublishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Singsong': require('@/assets/fonts/Singsong.otf'),
  });

  useEffect(() => {
    if (error) {
      console.warn('Error loading custom font Singsong:', error);
    }
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
        <ThemeProvider>
          <RevenueCatProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="questionnaire" />
              <Stack.Screen name="forgot" />
              <Stack.Screen name="home" />
              <Stack.Screen name="history" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="account" />
              <Stack.Screen name="about" />
              <Stack.Screen name="pricing" />
              <Stack.Screen name="analyzing" />
              <Stack.Screen name="chat" />
            </Stack>
          </RevenueCatProvider>
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
