import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, ScrollView, Keyboard } from 'react-native';
import { Text, View } from '@/components/Themed';
import { RentalItemCard } from '@/components/RentalItemCard';
import { getCategories, getRentalItems } from '@/lib/queries';
import { Category, RentalItem } from '@/lib/supabase';
import { ModeGuard } from '../guards/ModeGuard';
import SearchBar from '@/ui/components/SearchBar';
import Chip from '@/ui/components/Chip';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function BrowseScreen() {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RentalItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getRentalItems(),
        getCategories()
      ]);
      
      setItems(itemsData);
      setFilteredItems(itemsData);
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
  }, []);

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  useEffect(() => {
    let filtered = items;
    
    if (selectedCategories.length > 0) {
      filtered = items.filter(item => selectedCategories.includes(item.category));
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategories, items, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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
    <ModeGuard requiredMode='renter'>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            iconSource={<Ionicons name="search" size={18} color={Colors.text.disabled} />}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
          keyboardShouldPersistTaps="handled"
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
                trailingIconSource={<Ionicons name="close" size={13} color={Colors.brand.primary} />}
                onPress={() => handleCategoryPress(category.name)}
                style={styles.chip}
              />
            );
          })}
        </ScrollView>

        <FlatList
          data={filteredItems}
          renderItem={({ item }) => <RentalItemCard item={item} />}
          keyExtractor={(item)=> item.id}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedCategories.length === 0
                  ? 'No items available'
                  : `No items found in the selected categories`
                }
              </Text>
              <Text style={styles.emptySubtext}>Check back later for new rentals!</Text>
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
    backgroundColor: Colors.background.secondary,
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
  searchContainer: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
    paddingBottom: 11,
    paddingTop: 11,
  },
  categoryFilter: {
    backgroundColor: Colors.background.primary,
    maxHeight: 60,
    paddingHorizontal: 20,
    paddingTop: 11,
    paddingBottom: 11,
  },
  categoryFilterContent: {
    alignItems: 'center',
  },
  chip: {
    marginRight: 8,
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
});