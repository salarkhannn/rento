import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { updateBookingPhotos } from '@/lib/queries';
import { useAuth } from '@/lib/AuthContext';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import Button from '@/ui/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyHandoverScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'check_in' | 'check_out' }>();
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload up to 4 photos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to verify the item condition.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const uploadImages = async (bookingId: string, uris: string[]) => {
    const uploadedUrls = [];
    for (const uri of uris) {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: `handover_${Date.now()}.jpg`,
      } as any);

      const filename = `handover/${bookingId}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('rental-images').upload(filename, formData);
      
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('rental-images').getPublicUrl(filename);
        uploadedUrls.push(publicUrl);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert('Photos Required', 'Please upload at least one photo of the item condition.');
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadImages(id, images);
      await updateBookingPhotos(id, type, urls);
      
      Alert.alert('Success', 'Condition photos uploaded successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Handover upload error:', error);
      Alert.alert('Error', 'Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.description}>
        Please upload clear photos of the item from different angles to document its current condition. 
        This helps protect you in case of disputes.
      </Text>

      <View style={styles.imageGrid}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => setImages(images.filter((_, i) => i !== index))}
            >
              <Ionicons name="close-circle" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 4 && (
          <TouchableOpacity style={styles.addButton} onPress={pickImage} activeOpacity={0.7}>
            <View style={styles.addButtonInner}>
              <Ionicons name="camera-outline" size={32} color={Colors.brand.primary} />
              <Text style={styles.addText}>Add Photo</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title={uploading ? 'Uploading...' : 'Submit Evidence'}
          onPress={handleSubmit}
          disabled={uploading || images.length === 0}
          loading={uploading}
          variant="filled"
          color="colored"
          size="large"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  description: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  imageWrapper: {
    width: '48%',
    aspectRatio: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
  },
  addButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.background.tertiary,
    borderStyle: 'dashed',
    backgroundColor: Colors.background.secondary,
  },
  addButtonInner: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    ...typography.caption1Medium,
    color: Colors.brand.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    marginTop: 24,
  },
});
