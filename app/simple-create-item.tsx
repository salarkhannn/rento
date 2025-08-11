import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { createRentalItem } from '@/lib/queries';
import { useAuth } from '@/lib/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories } from './utils/categories';
import { ModeGuard } from './guards/ModeGuard';

// Simple version without maps for debugging
export default function SimpleCreateItemScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !price || !location || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be signed in to create an item');
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        title: title.trim(),
        description: description.trim(),
        price: priceNumber,
        location: location.trim(),
        category,
        owner_id: user.id,
        is_available: true,
        // Default coordinates for San Francisco
        latitude: 37.7749,
        longitude: -122.4194,
        address: location.trim(),
        pickup_method: 'renter_pickup' as const,
      };

      console.log('Creating rental item with data:', itemData);
      await createRentalItem(itemData);

      Alert.alert(
        'Success',
        'Item created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating item:', error);
      let errorMessage = 'Failed to create item. Please try again.';
      
      if (error instanceof Error) {
        console.error('Full error:', error);
        errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModeGuard requiredMode='lender'>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>List New Item (Simple)</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Item Title *"
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description *"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Price per day (USD) *"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="General Location (e.g., City, Neighborhood) *"
            value={location}
            onChangeText={setLocation}
          />
          
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonSelected
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextSelected
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.submitButton, { opacity: loading ? 0.5 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Create Item'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ModeGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
