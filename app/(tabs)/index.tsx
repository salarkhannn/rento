import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { RentalItemCard } from '@/components/RentalItemCard';
import { getCategories, getRentalItems } from '@/lib/queries';
import { Category, RentalItem } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import SearchBar from '@/ui/components/SearchBar';
import Chip from '@/ui/components/Chip';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import SearchFilters from '@/components/SearchFilters';
import ProximityMap from '@/components/ProximityMap';
import * as Location from 'expo-location';

export default function BrowseScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<RentalItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RentalItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    minPrice: '',
    maxPrice: '',
    distance: 'Any',
  });
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();
  }, []);

  const loadData = async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getRentalItems(),
        getCategories()
      ]);
      
      const availableItems = user 
        ? itemsData.filter(item => item.owner_id !== user.id)
        : itemsData;
      
      setItems(availableItems);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  useEffect(() => {
    let filtered = items;
    
    // Category Filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    // Price Filter
    if (activeFilters.minPrice) {
      filtered = filtered.filter(item => item.price >= parseFloat(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice) {
      filtered = filtered.filter(item => item.price <= parseFloat(activeFilters.maxPrice));
    }

    // Distance Filter
    if (activeFilters.distance !== 'Any' && userLocation) {
      const radius = parseFloat(activeFilters.distance);
      filtered = filtered.filter(item => {
        if (!item.latitude || !item.longitude) return false;
        const dist = calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          item.latitude,
          item.longitude
        );
        return dist <= radius;
      });
    }

    setFilteredItems(filtered);
  }, [selectedCategories, items, searchQuery, activeFilters, userLocation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'list' ? 'map' : 'list');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchBarContainer}>
            <SearchBar
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              iconSource={<Ionicons name="search" size={18} color={Colors.text.disabled} />}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFiltersVisible(true)}
          >
            <Ionicons name="options-outline" size={24} color={Colors.text.primary} />
            {(activeFilters.minPrice || activeFilters.maxPrice || activeFilters.distance !== 'Any') && (
              <View style={styles.filterDot} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map(category => {
            const isSelected = selectedCategories.includes(category.name);
            return (
              <Chip
                key={category.id}
                text={category.name}
                state={isSelected ? 'active' : 'default'}
                outline={true}
                leadingIcon={false}
                trailingIcon={isSelected}
                onPress={() => {
                  setSelectedCategories(prev => 
                    prev.includes(category.name) 
                      ? prev.filter(c => c !== category.name)
                      : [...prev, category.name]
                  );
                }}
                style={styles.chip}
              />
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {viewMode === 'list' ? (
          <FlatList
            data={filteredItems}
            renderItem={({ item }) => <RentalItemCard item={item} />}
            keyExtractor={(item)=> item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={60} color={Colors.text.disabled} />
                <Text style={styles.emptyText}>No items found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters or search query.</Text>
              </View>
            }
          />
        ) : (
          <ProximityMap 
            items={filteredItems} 
            initialRegion={userLocation ? {
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            } : undefined}
          />
        )}
      </View>

      <TouchableOpacity style={styles.viewToggle} onPress={toggleViewMode}>
        <Ionicons name={viewMode === 'list' ? "map" : "list"} size={20} color="#fff" />
        <Text style={styles.viewToggleText}>{viewMode === 'list' ? 'Map' : 'List'}</Text>
      </TouchableOpacity>

      <SearchFilters
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={activeFilters}
        onApply={setActiveFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  searchBarContainer: {
    flex: 1,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
    borderWidth: 1,
    borderColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  categoryFilter: {
    maxHeight: 60,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  categoryFilterContent: {
    alignItems: 'center',
    paddingRight: 40,
  },
  chip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: Colors.text.primary,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    paddingBottom: 100,
  },
  viewToggle: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: Colors.text.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  viewToggleText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});