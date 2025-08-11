
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, router, useRouter, useSegments } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { getUnreadNotificationCount } from '@/lib/notificationQueries';
import { useAuth } from '@/lib/AuthContext';
import NavigationBar from '@/ui/components/Navbar';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function NotificationsIcon() {
  const { session, isInitialized } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only load notifications if user is authenticated
    if (session && isInitialized) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session, isInitialized]);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread notification count:', error);
    }
  };

  // Don't show notifications icon if not authenticated
  if (!session || !isInitialized) {
    return null;
  }

  return (
    <Pressable onPress={() => router.push('/(tabs)/notifications')}>
      {({ pressed }) => (
        <View style={styles.notificationIconContainer}>
          <FontAwesome
            name="bell-o"
            size={25}
            color={Colors.text.primary}
            style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount.toString()}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

function CustomTabBar() {
  const { mode, session, loading, isInitialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  
  // When user signs out, redirect to browse page
  useEffect(() => {
    if (isInitialized && !loading && !session) {
      // Redirect to browse page when user signs out
      router.replace('/(tabs)/' as any);
    }
  }, [session, isInitialized, loading, router]);
  
  // If user is not authenticated, only show the browse tab
  if (!session && isInitialized && !loading) {
    return (
      <NavigationBar
        mode="guest"
        activeTab={0}
        onTabPress={(index, label) => {
          // For guest mode, handle navigation appropriately
          if (index === 0) {
            router.push('/(tabs)/' as any);
          } else if (index === 1) {
            // Navigate to sign in
            router.push('/auth/auth-start');
          }
        }}
      />
    );
  }

  // If user is authenticated but mode is not yet loaded, show loading state
  if (session && (!mode || !isInitialized)) {
    return (
      <NavigationBar
        mode="renter"
        activeTab={0}
        onTabPress={() => {}}
      />
    );
  }
  
  // Determine the active tab based on current route
  const getActiveTab = () => {
    const currentTab = segments[1]; // Get the tab name from segments
    
    if (mode === 'renter') {
      const renterTabs = ['index', 'wishlist', 'bookings', 'messages', 'profile'];
      const index = currentTab ? renterTabs.indexOf(currentTab) : 0;
      return index === -1 ? 0 : index; // Default to first tab if not found
    } else {
      const lenderTabs = ['dashboard', 'listings', 'lender-bookings', 'messages', 'profile'];
      const index = currentTab ? lenderTabs.indexOf(currentTab) : 0;
      return index === -1 ? 0 : index; // Default to first tab if not found
    }
  };

  const handleTabPress = (index: number, label: string) => {
    try {
      if (mode === 'renter') {
        const renterRoutes = ['/(tabs)/', '/(tabs)/wishlist', '/(tabs)/bookings', '/(tabs)/messages', '/(tabs)/profile'];
        if (index >= 0 && index < renterRoutes.length) {
          router.push(renterRoutes[index] as any);
        }
      } else {
        const lenderRoutes = ['/(tabs)/dashboard', '/(tabs)/listings', '/(tabs)/lender-bookings', '/(tabs)/messages', '/(tabs)/profile'];
        if (index >= 0 && index < lenderRoutes.length) {
          router.push(lenderRoutes[index] as any);
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <NavigationBar
      mode={mode as 'renter' | 'lender'}
      activeTab={getActiveTab()}
      onTabPress={handleTabPress}
    />
  );
}

export default function TabLayout() {
  const { mode } = useAuth();

  // Header style configuration
  const headerTitleStyle = {
    ...typography.title1Medium,
    color: Colors.text.primary,
  };

  const screenOptions = {
    tabBarActiveTintColor: Colors.tint,
    headerShown: useClientOnlyValue(false, true),
    headerRight: () => <NotificationsIcon />,
    headerTitleStyle,
    headerStyle: {
      backgroundColor: Colors.background.primary,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerTitleAlign: 'left' as const,
    headerLeftContainerStyle: { paddingLeft: 0 },
    headerRightContainerStyle: { paddingRight: 0 },
    headerTitleContainerStyle: { paddingLeft: 0 },
  };

  // Conditionally render tabs based on mode
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={screenOptions}>
        {/* Renter Tabs */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Browse Items',
            tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
            href: mode === 'renter' ? '/' : null,
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: 'Wishlist',
            tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
            href: mode === 'renter' ? '/wishlist' : null,
            headerShown: false, // Hide header since the screen implements its own
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
            href: mode === 'renter' ? '/bookings' : null,
          }}
        />

        {/* Lender Tabs */}
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <TabBarIcon name="tachometer" color={color} />,
            href: mode === 'lender' ? '/dashboard' : null,
          }}
        />
        <Tabs.Screen
          name="listings"
          options={{
            title: 'Listings',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
            href: mode === 'lender' ? '/listings' : null,
            headerRight: () => (
              <Link href="/create-item" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="plus"
                      size={25}
                      color={Colors.text.primary}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="lender-bookings"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
            href: mode === 'lender' ? '/lender-bookings' : null,
          }}
        />

        {/* Common Tabs */}
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color }) => <TabBarIcon name="envelope" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
        <Tabs.Screen name="notifications" options={{ href: null }} />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  notificationIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: 10,
    top: -5,
    backgroundColor: Colors.colors.red,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.background.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
