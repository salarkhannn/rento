import React, { useState, useEffect } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { getMyListings } from '@/lib/queries';
import { RentalItem } from '@/lib/supabase';
import { ModeGuard } from '../guards/ModeGuard';

export default function ListingsTab() {
  const [listings, setListings] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const loadListings = async () => {
    try {
      const data = await getMyListings();
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
      Alert.alert('Error', 'Failed to load listings. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const renderListing = ({ item }: { item: RentalItem }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      <View style={styles.listingHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.is_available ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.statusText}>
            {item.is_available ? 'Available' : 'Not Available'}
          </Text>
        </View>
      </View>

      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.location}>📍 {item.location}</Text>

      <View style={styles.footer}>
        <Text style={styles.price}>${item.price}/day</Text>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => router.push(`/manage-listing/${item.id}`)}
        >
          <Text style={styles.manageButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2f95dc" />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }

  return (
    <ModeGuard requiredMode="lender">
      <View style={styles.container}>
        <FlatList
          data={listings}
          renderItem={renderListing}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No Listings Yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first listing to start earning!
              </Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => router.push('/create-item')}
              >
                <Text style={styles.createFirstButtonText}>Create Your First Listing</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </ModeGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f95dc',
  },
  manageButton: {
    backgroundColor: '#2f95dc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
