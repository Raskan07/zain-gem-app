import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

import BiometricAuth from '@/components/auth/BiometricAuth';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Set initial route to greeting screen
  initialRouteName: 'screens/greeting',
};

import { initializeNotifications, registerForPushNotificationsAsync } from '@/lib/notifications';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Initialize notifications handler
initializeNotifications();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Orbitron: require('../assets/fonts/Orbitron-VariableFont_wght.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      registerForPushNotificationsAsync();

      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        if (data?.url) {
          router.push({
            pathname: data.url as any,
            params: { remainderId: data.remainderId as string }
          });
        }
      });

      return () => subscription.remove();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="dark">
        <BiometricAuth>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {/* Disable the default header globally. Individual screens can override this via their own options. */}
                <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                name="modal"
                options={{
                presentation: 'transparentModal',
                contentStyle: { height: '50%' },
                }}
                />
                <Stack.Screen
                name="screens/verify"
                options={{
                presentation: 'modal',
                contentStyle: { height: '50%' },
                }}
                />
                <Stack.Screen name="change-password" options={{ headerShown: false }} />
                </Stack>
            </ThemeProvider>
        </BiometricAuth>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
  