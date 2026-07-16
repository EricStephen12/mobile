import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider } from '../theme/ThemeContext';
import { RevenueCatProvider } from '../theme/RevenueCatProvider';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '../theme/tokenCache';
import * as Sentry from '@sentry/react-native';
import PostHog from 'posthog-react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!clerkPublishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
}

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
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
            <PostHog
              apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY || 'phc_placeholder_key'}
              options={{
                host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
              }}
            >
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
            </PostHog>
          </RevenueCatProvider>
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
