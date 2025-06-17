import { Text, View } from "@/components/Themed";
import { getRentalItem, updateRentalItem } from "@/lib/queries";
import { RentalItem } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditListingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [item, setItem] = useState<RentalItem | null>(null);
    const [ title, setTitle ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ price, setPrice ] = useState('');
    const [ location, setLocation ] = useState('');
    const [ category, setCategory ] = useState('');
    const [ isAvailable, setIsAvailable ] = useState(true);
    const [ loading, setLoading ] = useState(true);
    const [ saving, setSaving ] = useState(false);

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
            setItem(data);
            setTitle(data?.title || '');
            setDescription(data?.description || '');
            setPrice(data?.price?.toString() || '');
            setLocation(data?.location || '');
            setCategory(data?.category || '');
            setIsAvailable(data?.is_available ?? false);
        } catch (error) {
            console.error('Error loading item:', error);
            Alert.alert('Error', 'Failed to load listing details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !description || !price || !location || !category) {
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
                title,
                description,
                price: priceNumber,
                location,
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

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading listing details...</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Edit Listing</Text>

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
                            {isAvailable ? 'Available' : 'Unavailable'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { opacity: saving ? 0.5 : 1 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  availabilitySection: {
    marginBottom: 20,
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
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});