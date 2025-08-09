import { Text, View } from "@/components/Themed";
import { useAuth } from "@/lib/AuthContext";
import { createBooking, getRentalItem } from "@/lib/queries";
import { RentalItem } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import Button from '@/ui/components/Button';
import Card from '@/ui/components/Card';
import DatePickerField from '@/ui/components/DatePickerField';

import Constants from 'expo-constants';

import { handleBookingRequest } from "@/lib/notificationQueries";
import { NotificationTemplates, scheduleLocalNotification } from "@/lib/notifications";

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, mode } = useAuth();
    const [item, setItem] = useState<RentalItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // console.log("EXECUTION ENVIRONMENT:", Constants.executionEnvironment);

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
        if (!item || !user) return;

        console.log('Creating booking with:', {
          item_id: item.id,
          user_id: user.id,
          start_date: startDate,
          end_date: endDate
        });

        setBookingLoading(true);
        try {
            const booking = await createBooking({
                item_id: item.id,
                renter_id: user.id,
                start_date: startDate,
                end_date: endDate,
                total_price: calculateTotalPrice(),
            });

            console.log('Booking created successfully:', booking);

            // Send notification to item owner
            await handleBookingRequest(booking.id, item.id, booking.renter_id);

            // Show local notification to the user who made the booking
            await scheduleLocalNotification(
                '🎉 Booking Request Sent!',
                `Your booking request for "${item.title}" has been sent to the owner`,
                2,
                { 
                    booking_id: booking.id, 
                    item_id: item.id,
                    action: 'booking_created'
                }
            );

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
                <ActivityIndicator size="large" color={Colors.brand.primary} />
                <Text style={styles.loadingText}>Loading item details...</Text>
            </View>
        )
    }

    if (!item) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Item not found</Text>
                <Button 
                    title="Go Back"
                    onPress={() => router.back()}
                    style={styles.button}
                />
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.backButtonContainer}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
            </View>
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

                {item.is_available && user?.id !== item.owner_id && mode === 'renter' && (
                    <View style={styles.bookingSection}>
                        <Text style={styles.sectionTitle}>Book this item</Text>

                        <View style={styles.dateInputs}>
                            <DatePickerField
                                title="Start Date"
                                placeholder="Select start date"
                                value={startDate}
                                onDateChange={setStartDate}
                                style={styles.dateInput}
                            />
                            
                            <DatePickerField
                                title="End Date"
                                placeholder="Select end date"
                                value={endDate}
                                onDateChange={setEndDate}
                                style={styles.dateInput}
                            />

                            {startDate && endDate && (
                                <View style={styles.priceCalculation}>
                                    <Text style={styles.calculationText}>
                                        Total: ${calculateTotalPrice()} ({Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
                                    </Text>
                                </View>
                            )}

                            <Button
                                title={bookingLoading ? 'Creating Booking...' : 'Request Booking'}
                                onPress={handleBooking}
                                disabled={bookingLoading}
                                variant="filled"
                                size="medium"
                                style={styles.bookButton}
                            />

                            <Button
                                title="Contact Owner"
                                onPress={() => router.push(`/conversation/${item.owner_id}?name=${encodeURIComponent(item.owner?.name || 'Owner')}`)}
                                variant="bordered"
                                size="medium"
                                style={styles.contactButton}
                            />
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
    backgroundColor: Colors.background.primary,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
    marginTop: 10,
  },
  errorText: {
    ...typography.headlineSemibold,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 300,
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    ...typography.title1Medium,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 16,
  },
  price: {
    ...typography.title2Regular,
    color: Colors.brand.primary,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    ...typography.calloutEmphasized,
    color: Colors.text.primary,
    width: 80,
  },
  value: {
    ...typography.calloutRegular,
    color: Colors.text.secondary,
    flex: 1,
  },
  sectionTitle: {
    ...typography.headlineSemibold,
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    ...typography.bodyRegular,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  bookingSection: {
    marginTop: 24,
    borderRadius: 12,
  },
  dateInputs: {
    marginBottom: 16,
  },
  dateInput: {
    marginBottom: 12,
  },
  priceCalculation: {
    backgroundColor: Colors.brand.primaryLight,
    padding: 10,
    borderRadius: 100,
    marginBottom: 16,
  },
  calculationText: {
    ...typography.calloutEmphasized,
    color: Colors.brand.primary,
    textAlign: 'center',
  },
  bookButton: {
    marginBottom: 12,
    width: '100%',
  },
  contactButton: {
    marginTop: 0,
    width: '100%',
  },
  button: {
    marginTop: 16,
  },
  unavailableSection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  unavailableText: {
    ...typography.calloutEmphasized,
    color: Colors.colors.red,
  },
});