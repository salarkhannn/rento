import { Text, View } from "@/components/Themed";
import { useAuth } from "@/lib/AuthContext";
import { createBooking, getRentalItem } from "@/lib/queries";
import { RentalItem } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";

import DateTimePicker from '@react-native-community/datetimepicker'

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [item, setItem] = useState<RentalItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        loadItem();
    }, [id]);

    const loadItem = async () => {
        if (!id) return;

        try {
            const data = await getRentalItem(id);
            setItem(data);
        } catch (error) {
            console.error("Error loading item: ", error);
            Alert.alert('Error', 'Failed to load item details');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalPrice = () => {
        if (!startDate || !endDate || !item) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        return Math.max(1, days) * item.price;
    };

    const handleBooking = async () => {
        if (!item || !user) {
            Alert.alert('Error', 'Please sign in to make a booking');
            return;
        }

        if (!startDate || !endDate) {
            Alert.alert('Error', 'Please select both start and end dates');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            Alert.alert('Error', 'End date must be after start date');
            return;
        }

        if (user.id === item.owner_id) {
            Alert.alert('Error', 'You cannot book your own item');
            return;
        }

        const totalPrice = calculateTotalPrice();

        Alert.alert(
            'Confirm Booking',
            `Book ${item.title} from ${startDate} to ${endDate} for $${totalPrice}?`,
            [
                { text: 'Cancel' },
                { text: 'Confirm', onPress: confirmBooking },
            ]
        );
    };

    const confirmBooking = async () => {
        if (!item) return;

        setBookingLoading(true);
        try {
            await createBooking({
                item_id: item.id,
                start_date: startDate,
                end_date: endDate,
                total_price: calculateTotalPrice(),
            });

            Alert.alert(
                'Success',
                'Booking request sent! You can view it in your bookings tab.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Booking error: ', error);
            Alert.alert('Error', 'Failed to create booking. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2f95dc" />
                <Text>Loading item details...</Text>
            </View>
        )
    }

    if (!item) {
        return (
            <View style={styles.centerContainer}>
                <Text>Item not found</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.image} />
            ): (
                <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>No image available</Text>
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.price}>${item.price}/day</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Location:</Text>
                    <Text style={styles.value}>{item.location}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Owner:</Text>
                    <Text style={styles.value}>{item.owner?.name || 'Unkown'}</Text>
                </View>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{item.description}</Text>

                {item.is_available && user?.id !== item.owner_id && (
                    <View style={styles.bookingSection}>
                        <Text style={styles.sectionTitle}>Book this item</Text>

                        <View style={styles.dateInputs}>
                            <View style={styles.dateInput}>
                                <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD):</Text>
                                <TouchableOpacity
                                  style={styles.dateButton}
                                  onPress={() => setShowStartPicker(true)}
                                >
                                  <Text style={[
                                    styles.dateButtonText,
                                    { color: startDate ? '#333' : '#999'}  
                                  ]}>
                                    {startDate || 'Select start date'}
                                  </Text>
                                </TouchableOpacity>
                                
                              {showStartPicker && (
                                <DateTimePicker
                                    value={startDate ? new Date(startDate) : new Date()}
                                    mode="date"
                                    display="default"
                                    minimumDate={new Date()}
                                    onChange={(event, selectedDate) => {
                                      setShowStartPicker(false);
                                      if (selectedDate) {
                                        setStartDate(selectedDate.toISOString().split('T')[0]);
                                      }
                                    }}
                                />
                              )}
                            </View>
                            <View style={styles.dateInput}>
                                <Text style={styles.inputLabel}>End Date (YYYY-MM-DD):</Text>
                                <TouchableOpacity
                                  style={styles.dateButton}
                                  onPress={() => setShowEndPicker(true)}
                                >
                                  <Text style={[
                                    styles.dateButtonText,
                                    { color: endDate ? '#333' : '#999' }
                                  ]}>
                                      {endDate || 'Select end date'}
                                  </Text>
                                </TouchableOpacity>

                                {showEndPicker && (
                                  <DateTimePicker
                                    value={endDate ? new Date(endDate) : new Date()}
                                    mode="date"
                                    display="default"
                                    minimumDate={startDate ? new Date(startDate) : new Date()}
                                    onChange={(event, selectedDate) => {
                                      setShowEndPicker(false);
                                      if (selectedDate) {
                                        setEndDate(selectedDate.toISOString().split('T')[0]);
                                      }
                                    }}
                                  />
                                )}
                            </View>

                            {startDate && endDate && (
                                <View style={styles.priceCalculation}>
                                    <Text style={styles.calculationText}>
                                        Total: ${calculateTotalPrice()} ({Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity 
                                style={[styles.bookButton, { opacity: bookingLoading ? 0.5 : 1 }]}
                                onPress={handleBooking}
                                disabled={bookingLoading}
                            >
                                <Text style={styles.bookButtonText}>
                                    {bookingLoading ? 'Creating Booking...' : 'Request Booking'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {!item.is_available && (
                    <View style={styles.unavailableSection}>
                        <Text style={styles.unavailableText}>This item is currently unavailable</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2f95dc',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
  },
  value: {
    fontSize: 16,
    flex: 1,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  bookingSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  dateInputs: {
    marginBottom: 16,
  },
  dateInput: {
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
      fontSize: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  priceCalculation: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  calculationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#2f95dc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
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
    textAlign: 'center',
  },
  unavailableSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 16,
    color: '#c62828',
    fontWeight: '600',
  },
});