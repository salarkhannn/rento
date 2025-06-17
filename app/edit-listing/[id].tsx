import { Text, View } from "@/components/Themed";
import { getRentalItem, updateRentalItem } from "@/lib/queries";
import { RentalItem } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditListingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [item, setItem] = useState<RentalItem | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const categories = [
        'Electronics', 'Vehicles', 'Tools', 'Sports', 'Home & Garden', 'Events', 'Other'
    ];

    useEffect(() => {
        loadItem();
    }, [id]);

    const loadItem = async () => {
        if (!id) return;

        try {
            const data = await getRentalItem(id);
            if (data) {
                setItem(data);
                setTitle(data.title || '');
                setDescription(data.description || '');
                setPrice(data.price?.toString() || '');
                setLocation(data.location || '');
                setCategory(data.category || '');
                setIsAvailable(data.is_available ?? true);
            }
        } catch (error) {
            console.error('Error loading item:', error);
            Alert.alert('Error', 'Failed to load listing details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !description.trim() || !price.trim() || !location.trim() || !category.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const priceNumber = parseFloat(price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            Alert.alert('Error', 'Price must be a valid number greater than 0');
            return;
        }

        setSaving(true);
        try {
            await updateRentalItem(id!, {
                title: title.trim(),
                description: description.trim(),
                price: priceNumber,
                location: location.trim(),
                category,
                is_available: isAvailable,
            });

            Alert.alert(
                'Success',
                'Listing updated successfully',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error saving item:', error);
            Alert.alert('Error', 'Failed to update listing');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        if (item) {
            setTitle(item.title || '');
            setDescription(item.description || '');
            setPrice(item.price?.toString() || '');
            setLocation(item.location || '');
            setCategory(item.category || '');
            setIsAvailable(item.is_available ?? true);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2f95dc" />
                <Text style={styles.loadingText}>Loading listing details...</Text>
            </View>
        );
    }

    if (!item) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Listing not found</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Edit Listing</Text>
                    <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Item Title"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />

                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your item..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                    />

                    <Text style={styles.inputLabel}>Price per day (USD)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />

                    <Text style={styles.inputLabel}>Location</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter location"
                        value={location}
                        onChangeText={setLocation}
                        maxLength={100}
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

                    <View style={styles.availabilitySection}>
                        <Text style={styles.label}>Availability</Text>
                        <TouchableOpacity
                            style={[
                                styles.availabilityButton,
                                { backgroundColor: isAvailable ? '#4CAF50' : '#FF9800' }
                            ]}
                            onPress={() => setIsAvailable(!isAvailable)}
                        >
                            <Text style={styles.availabilityText}>
                                {isAvailable ? '✓ Available' : '✗ Unavailable'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.saveButton, { opacity: saving ? 0.5 : 1 }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
  errorText: {
    fontSize: 18,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
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
    marginBottom: 12,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
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
  availabilitySection: {
    marginBottom: 30,
  },
  availabilityButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  availabilityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.45,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.45,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2f95dc',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});