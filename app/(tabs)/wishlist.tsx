import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { WishlistItemCard } from '@/components/WishlistItemCard';
import { RentalItem } from '@/lib/supabase';
import { getWishlistItems } from '@/lib/queries';
import { ConditionalAuthGuard } from '@/components/ConditionalAuthGuard';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { getUnreadNotificationCount } from '@/lib/notificationQueries';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/AuthContext';

export default function WishlistScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [wishlist, setWishlist] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function NotificationsIcon() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      // Only load notifications if user is authenticated
      if (user) {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
      } else {
        // Clear count when user is not authenticated
        setUnreadCount(0);
      }
    }, [user]);

    const loadUnreadCount = async () => {
      // Double check user is still authenticated before making the call
      if (!user) return;
      
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

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      // Clear wishlist when user signs out
      setWishlist([]);
      setLoading(false);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getWishlistItems();
      setWishlist(data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWishlist();
  };

  const handleRemove = (itemId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== itemId));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Loading wishlist...</Text>
      </View>
    );
  }

  return (
    <ConditionalAuthGuard 
      requireAuth={true} 
      message="Please sign in to view your wishlist."
    >
      <View style={styles.container}>
        <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>Wishlist</Text>
          <NotificationsIcon />
        </View>
        <FlatList
          data={wishlist}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <WishlistItemCard item={item} onRemove={handleRemove} />}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Your wishlist is empty</Text>
              <Text style={styles.emptySubtext}>Save items you're interested in renting</Text>
            </View>
          }
        />
      </View>
    </ConditionalAuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  headerContainer: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.title1Medium,
    color: Colors.text.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
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