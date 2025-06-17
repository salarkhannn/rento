import { Text, View } from "@/components/Themed";
import { getMyListings } from "@/lib/queries";
import { RentalItem } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from "react-native";

export default function MyListingsScreen() {
    const [listings, setListings] = useState<RentalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
        setRefreshing(true);
        loadListings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadListings();
    }

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Listings</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/create-item')}
                >
                    <Text style={styles.addButtonText}>Add Listing</Text>
                </TouchableOpacity>
            </View>

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
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    elevation: 3,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
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
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
    fontSize: 16,
    fontWeight: '600',
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