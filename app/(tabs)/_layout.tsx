import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
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

export default function TabLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { mode } = useAuth();
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

  // Conditionally render tabs based on mode
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: useClientOnlyValue(false, true),
        }}>
        {mode === 'renter' && (
          <>
            <Tabs.Screen
              name="index"
              options={{
                title: 'Browse Items',
                tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
                // Hide "Create Item" button for renters
                headerRight: undefined,
              }}
            />
            <Tabs.Screen
              name="bookings"
              options={{
                title: 'Bookings',
                tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
              }}
            />
          </>
        )}
        {mode === 'lender' && (
          <>
            <Tabs.Screen
              name="my-listings"
              options={{
                title: 'My Listings',
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
          </>
        )}
        {/* Notifications and Profile tabs are always shown */}
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color }) => (
              <View style={styles.notificationIconContainer}>
                <TabBarIcon name="bell" color={color} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount.toString()}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
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
    right: -6,
    top: -3,
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