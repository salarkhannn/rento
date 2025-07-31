
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { AuthGuard } from '@/components/AuthGaurd';
import { getUnreadNotificationCount } from '@/lib/notificationQueries';
import { useAuth } from '@/lib/AuthContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function NotificationsIcon() {
  const [unreadCount, setUnreadCount] = useState(0);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread notification count:', error);
    }
  };

  return (
    <Pressable onPress={() => router.push('/(tabs)/notifications')}>
      {({ pressed }) => (
        <View style={styles.notificationIconContainer}>
          <FontAwesome
            name="bell-o"
            size={25}
            color={Colors[colorScheme ?? 'light'].text}
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

export default function TabLayout() {
  const { mode } = useAuth();
  console.log("MODE FROM USEAUTH: ", mode);
  const colorScheme = useColorScheme();

  // Conditionally render tabs based on mode
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: useClientOnlyValue(false, true),
          headerRight: () => <NotificationsIcon />,
        }}>
        {mode === 'renter' && (
          <>
            <Tabs.Screen
              name="index"
              options={{
                title: 'Explore',
                tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
              }}
            />
            <Tabs.Screen
              name="wishlist"
              options={{
                title: 'Wishlist',
                tabBarIcon: ({ color }) => <TabBarIcon name='heart' color={color} />,
              }}
            />
            <Tabs.Screen
              name="bookings"
              options={{
                title: 'Bookings',
                tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
              }}
            />
            <Tabs.Screen
              name='messages'
              options={{
                title: 'Messages',
                tabBarIcon: ({ color }) => <TabBarIcon name="envelope" color={color} />,
              }}
            />
          </>
        )}
        {mode === 'lender' && (
          <>
            <Tabs.Screen
              name="dashboard"
              options={{
                title: 'Dashboard',
                tabBarIcon: ({ color }) => <TabBarIcon name="tachometer" color={color} />,
              }}
            />
            <Tabs.Screen
              name="my-listings"
              options={{
                title: 'Listings',
                tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
                headerRight: () => (
                  <Link href="/create-item" asChild>
                    <Pressable>
                      {({ pressed }) => (
                        <FontAwesome
                          name="plus"
                          size={25}
                          color={Colors[colorScheme ?? 'light'].text}
                          style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                        />
                      )}
                    </Pressable>
                  </Link>
                ),
              }}
            />
            <Tabs.Screen
              name='lender-bookings'
              options={{
                title: 'Bookings',
                tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
              }}
            />
            <Tabs.Screen
              name='messages'
              options={{
                title: 'Messages',
                tabBarIcon: ({ color }) => <TabBarIcon name="envelope" color={color} />,
              }}
            />
          </>
        )}
        {/* Profile tab is always shown */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
        <Tabs.Screen name="notifications" options={{ href: null }} />
      </Tabs>
    </AuthGuard>
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
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
