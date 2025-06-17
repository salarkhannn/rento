import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { createRentalItem } from '@/lib/queries';
import { useAuth } from '@/lib/AuthContext';

import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateItemScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const categories = [
    'Electronics', 'Vehicles', 'Tools', 'Sports', 'Home & Garden', 'Events', 'Other'
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll persmissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  // image upload function
  const uploadImage = async (uri: string) => {
    if (!user || !uri) return null;

    try {
      setUploading(true);

      // create form data
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: `${Date.now()}.jpg`,
      } as any);

      // upload to supabase storage
      const filename = `${user.id}/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('rental-images')
        .upload(filename, formData);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('rental-images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Error uplooading iamge:', error);
      return null;
    } finally {
      setUploading(false);
    }
  }

  const handleSubmit = async () => {
    if (!title || !description || !price || !location || !category) {
      Alert.alert('Error', 'Please fill in all fields');
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
      let imageUrl: string | null = null;

      // Upload image if selected
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      }

      await createRentalItem({
        title,
        description,
        price: priceNumber,
        location,
        category,
        owner_id: user.id,
        is_available: true,
        image_url: imageUrl || undefined,
      });

      Alert.alert(
        'Success',
        'Item created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating item:', error);
      Alert.alert('Error', 'Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>List New Item</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Item Title"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Price per day (USD)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        
        <Text style={styles.label}>Category</Text>
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

        <View style={styles.imageSection}>
          <Text style={styles.label}>Photos</Text>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ): (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>+ Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
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

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
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
        padding: 16,
        paddingBottom: 100, // Extra bottom padding
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
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
        marginBottom: 8,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    categoryButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        margin: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryButtonSelected: {
        backgroundColor: '#2f95dc',
        borderColor: '#2f95dc',
    },
    categoryText: {
        fontSize: 14,
        color: '#666',
    },
    categoryTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    imageSection: {
        marginBottom: 20,
    },
    imageButton: {
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        fontSize: 16,
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20, // Add margin bottom
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 50, // Extra space at bottom
    },
});