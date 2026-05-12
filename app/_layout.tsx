import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { initializeNotifications } from '@/lib/notifications';
import { typography } from '@/ui/typography';
import Colors from '@/constants/Colors';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <NotificationRouter />
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function NotificationRouter() {
  const { mode } = useAuth();
  const modeRef = useRef(mode);
  const receivedListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    initializeNotifications();

    receivedListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      },
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { data } = response.notification.request.content;
        if (data) handleNotificationNavigation(data, modeRef.current);
      },
    );

    return () => {
      receivedListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return null;
}

function handleNotificationNavigation(data: any, mode: string | null) {
  // Route booking-related notifications to whichever bookings tab matches the
  // user's current mode. A lender approving a booking still lives under
  // /(tabs)/lender-bookings; a renter whose booking was approved lives under
  // /(tabs)/bookings.
  const bookingsRoute = mode === 'lender' ? '/(tabs)/lender-bookings' : '/(tabs)/bookings';

  if (data.action && data.booking_id) {
    switch (data.action) {
      case 'booking_created':
      case 'booking_cancelled':
      case 'booking_approved':
      case 'booking_rejected':
        router.push(bookingsRoute);
        return;
      case 'listing_deleted':
        router.push('/(tabs)/listings');
        return;
      default:
        router.push('/(tabs)/notifications');
        return;
    }
  }

  if (data.item_id) {
    router.push(`/item/${data.item_id}`);
    return;
  }

  router.push('/(tabs)/notifications');
}

function RootLayoutNav() {
  const screenOptions = {
    headerTitleStyle: {
      ...typography.title3Emphasized,
      color: Colors.text.primary,
    },
    headerStyle: {
      backgroundColor: Colors.background.primary,
    },
    headerShadowVisible: false,
    headerTitleAlign: 'center' as const,
    // iOS liquid-glass header
    headerTransparent: true,
    headerBlurEffect: 'regular' as const,
    headerLargeTitle: false,
    // Hide the previous screen's title next to the back chevron (iOS).
    // 'minimal' is the native-stack way; the older headerBackTitleVisible
    // is ignored by react-native-screens' native stack.
    headerBackButtonDisplayMode: 'minimal' as const,
    headerBackTitle: '',
    headerTintColor: Colors.brand.primary,
  };

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="create-item" options={{ title: 'Create Listing' }} />
        <Stack.Screen name="my-listings" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="manage-listing/[id]" options={{ title: 'Manage Listing' }} />
        <Stack.Screen name="edit-listing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="booking/payment" options={{ title: 'Payment' }} />
        <Stack.Screen name="booking/[id]/verify" options={{ title: 'Handover Proof', presentation: 'modal' }} />
        <Stack.Screen name="booking/[id]/review" options={{ title: 'Post-Rental Review', presentation: 'modal' }} />
        <Stack.Screen name="admin/dashboard" options={{ title: 'Admin Dashboard' }} />
        <Stack.Screen name="admin/verification-queue" options={{ title: 'Verification Queue' }} />
        <Stack.Screen name="admin/disputes" options={{ title: 'Disputes' }} />
      </Stack>
    </ThemeProvider>
  );
}
