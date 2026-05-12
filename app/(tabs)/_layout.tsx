import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { NotificationsIcon } from '@/components/NotificationsIcon';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/AuthContext';
import NavigationBar from '@/ui/components/Navbar';
import { typography } from '@/ui/typography';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function CustomTabBar() {
  const { mode, session, loading, isInitialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isInitialized && !loading && !session) {
      router.replace('/(tabs)');
    }
  }, [session, isInitialized, loading, router]);

  if (!session && isInitialized && !loading) {
    return (
      <NavigationBar
        mode="guest"
        activeTab={0}
        onTabPress={(index) => {
          if (index === 0) {
            router.push('/(tabs)');
          } else if (index === 1) {
            router.push('/auth/auth-start');
          }
        }}
      />
    );
  }

  if (session && (!mode || !isInitialized)) {
    return <NavigationBar mode="renter" activeTab={0} onTabPress={() => {}} />;
  }

  const getActiveTab = () => {
    const currentTab = segments[1];
    const tabs = mode === 'renter'
      ? ['index', 'wishlist', 'bookings', 'messages', 'profile']
      : ['dashboard', 'listings', 'lender-bookings', 'messages', 'profile'];

    // Routes like 'notifications' (header-only, not a tab) shouldn't highlight any tab.
    // Returning -1 makes <NavigationBar> render all icons in the unselected state.
    if (!currentTab) return 0;
    return tabs.indexOf(currentTab);
  };

  const handleTabPress = (index: number) => {
    try {
      const routes = mode === 'renter'
        ? ['/(tabs)', '/(tabs)/wishlist', '/(tabs)/bookings', '/(tabs)/messages', '/(tabs)/profile']
        : ['/(tabs)/dashboard', '/(tabs)/listings', '/(tabs)/lender-bookings', '/(tabs)/messages', '/(tabs)/profile'];
      if (index >= 0 && index < routes.length) {
        router.push(routes[index] as any);
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

  const screenOptions = {
    tabBarActiveTintColor: Colors.tint,
    headerShown: useClientOnlyValue(false, true),
    headerRight: () => <NotificationsIcon />,
    headerTitleStyle: {
      ...typography.title1Medium,
      color: Colors.text.primary,
    },
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

  return (
    <Tabs tabBar={() => <CustomTabBar />} screenOptions={screenOptions}>
      {/* Renter tabs */}
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
          headerShown: false,
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

      {/* Lender tabs */}
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
            <Pressable style={styles.listingsHeaderRight}>
              <NotificationsIcon />
              <Link href="/create-item" asChild>
                <Pressable hitSlop={8}>
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
            </Pressable>
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

      {/* Shared tabs */}
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
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Notifications', href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  listingsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
