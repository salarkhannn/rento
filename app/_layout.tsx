import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/lib/AuthContext';
import { initializeNotifications } from '@/lib/notifications';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Refs to store notification listeners
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Initialize notifications when app loads
    initializeNotifications();

    // Setup notification listeners
    const setupNotificationListeners = () => {
      // Handle notification received while app is running
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        // You can add custom logic here, like updating a badge count
      });

      // Handle notification tapped
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);
        
        // Handle navigation based on notification data
        const { data } = response.notification.request.content;
        if (data) {
          handleNotificationNavigation(data);
        }
      });
    };

    setupNotificationListeners();

    // Cleanup function
    return () => {
      if (notificationListener.current) {
        (notificationListener.current).remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const handleNotificationNavigation = (data: any) => {
      console.log('Handling notification navigation with data:', data);
      
      if (data.action && data.booking_id) {
          switch (data.action) {
              case 'booking_created':
              case 'booking_cancelled':
                  router.push('/(tabs)/bookings');
                  break;
              case 'booking_approved':
              case 'booking_rejected':
                  router.push('/(tabs)/bookings');
                  break;
              case 'listing_deleted':
                  router.push('/my-listings');
                  break;
              default:
                  router.push('/(tabs)/notifications');
          }
      } else if (data.item_id) {
          router.push(`/item/${data.item_id}`);
      } else {
          router.push('/(tabs)/notifications');
      }
  };

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="create-item" options={{ title: 'Create Listing' }} />
        <Stack.Screen name="my-listings" options={{ title: 'My Listings' }} />
        <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="manage-listing/[id]" options={{ title: 'Manage Listing' }} />
        <Stack.Screen name="edit-listing/[id]" options={{ title: 'Edit Listing' }} />
      </Stack>
    </ThemeProvider>
  );
}