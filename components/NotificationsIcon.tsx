import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/AuthContext';
import { getUnreadNotificationCount } from '@/lib/notificationQueries';

const POLL_INTERVAL_MS = 30_000;

export function NotificationsIcon() {
  const { session, isInitialized } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session || !isInitialized) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const count = await getUnreadNotificationCount();
        if (!cancelled) setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread notification count:', error);
      }
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session, isInitialized]);

  if (!session || !isInitialized) return null;

  return (
    <Pressable
      testID="notifications-button"
      onPress={() => router.push('/(tabs)/notifications')}
      hitSlop={8}
    >
      {({ pressed }) => (
        <View style={styles.container}>
          <FontAwesome
            name="bell-o"
            size={25}
            color={Colors.text.primary}
            style={[styles.icon, pressed && styles.pressed]}
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  icon: {
    marginRight: 15,
  },
  pressed: {
    opacity: 0.5,
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
