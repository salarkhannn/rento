import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { WishlistItemCard } from '@/components/WishlistItemCard';
import { NotificationsIcon } from '@/components/NotificationsIcon';
import { RentalItem } from '@/lib/supabase';
import { getWishlistItems } from '@/lib/queries';
import { ConditionalAuthGuard } from '@/components/ConditionalAuthGuard';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/AuthContext';

export default function WishlistScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [wishlist, setWishlist] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
          testID="wishlist-flatlist"
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
    backgroundColor: Colors.background.primary,
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
    backgroundColor: Colors.background.primary,
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
    paddingBottom: 120,
    gap: 10,
  },
});