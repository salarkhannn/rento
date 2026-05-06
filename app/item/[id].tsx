import { Text, View } from "@/components/Themed";
import { useAuth } from "@/lib/AuthContext";
import { createBooking, getRentalItem, getItemReviews, getItemBookings } from "@/lib/queries";
import { RentalItem, Review, Booking } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useAuthAction } from "@/components/ConditionalAuthGuard";
import VerificationBadge from "@/components/VerificationBadge";
import StarRating from "@/components/StarRating";

import Constants from 'expo-constants';

import DateTimePicker from '@react-native-community/datetimepicker'
import { handleBookingRequest } from "@/lib/notificationQueries";
import { NotificationTemplates, scheduleLocalNotification } from "@/lib/notifications";

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, mode, session } = useAuth();
    const { requireAuth } = useAuthAction();
    const [item, setItem] = useState<RentalItem | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [bookedDates, setBookedDates] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // console.log("EXECUTION ENVIRONMENT:", Constants.executionEnvironment);

    useEffect(() => {
        loadItem();
    }, [id]);

    const loadItem = async () => {
        if (!id) return;

        try {
            const [itemData, reviewsData, bookingsData] = await Promise.all([
                getRentalItem(id),
                getItemReviews(id),
                getItemBookings(id)
            ]);
            setItem(itemData);
            setReviews(reviewsData);
            setBookedDates(bookingsData.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING'));
        } catch (error) {
            console.error("Error loading item: ", error);
            Alert.alert('Error', 'Failed to load item details');
        } finally {
            setLoading(false);
        }
    };

    const calculateItemizedCharges = () => {
        if (!startDate || !endDate || !item) return { rentalFee: 0, deposit: 0, serviceFee: 0, total: 0, days: 0 };

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const numDays = Math.max(1, days);

        const rentalFee = numDays * item.price;
        const deposit = Math.round(rentalFee * 0.2); // 20% security deposit
        const serviceFee = Math.round(rentalFee * 0.05); // 5% service fee
        const total = rentalFee + deposit + serviceFee;

        return { rentalFee, deposit, serviceFee, total, days: numDays };
    };

    const handleBooking = async () => {
        // Use requireAuth to check if user is authenticated before proceeding
        requireAuth(async () => {
            if (!item || !user) {
                Alert.alert('Error', 'Unable to proceed with booking');
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

            const charges = calculateItemizedCharges();

            // Overlap check
            const newStart = new Date(startDate);
            const newEnd = new Date(endDate);
            const isOverlapping = bookedDates.some(booking => {
                const bookedStart = new Date(booking.start_date);
                const bookedEnd = new Date(booking.end_date);
                return (newStart <= bookedEnd && newEnd >= bookedStart);
            });

            if (isOverlapping) {
                Alert.alert('Unavailable', 'This item is already booked for the selected dates. Please choose different dates.');
                return;
            }

            Alert.alert(
                'Confirm Booking',
                `Total: $${charges.total}\n\nRental Fee: $${charges.rentalFee}\nSecurity Deposit: $${charges.deposit}\nService Fee: $${charges.serviceFee}`,
                [
                    { text: 'Cancel' },
                    { text: 'Confirm', onPress: confirmBooking },
                ]
            );
        }, "Please sign in to make a booking.");
    };

    const confirmBooking = async () => {
        if (!item || !user) return;

        const charges = calculateItemizedCharges();
        
        router.push({
            pathname: '/booking/payment',
            params: {
                itemId: item.id,
                startDate,
                endDate,
                rentalFee: charges.rentalFee,
                deposit: charges.deposit,
                serviceFee: charges.serviceFee,
                total: charges.total,
                itemTitle: item.title,
                ownerId: item.owner_id,
                autoAccept: item.auto_accept ? 'true' : 'false'
            }
        });
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
                    <View style={styles.ownerContainer}>
                        <Text style={styles.value}>{item.owner?.name || 'Unknown'}</Text>
                        {item.owner?.is_verified && <VerificationBadge />}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.reviewsSection}>
                    <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{review.reviewer?.name || 'User'}</Text>
                                    <StarRating rating={review.rating} size={14} />
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                                <Text style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noReviews}>No reviews yet for this item.</Text>
                    )}
                </View>

                {item.is_available && user?.id !== item.owner_id && mode === 'renter' && (
                    <View style={styles.bookingSection}>
                        <Text style={styles.sectionTitle}>Book this item</Text>

                        {bookedDates.length > 0 && (
                            <View style={styles.unavailableDatesContainer}>
                                <Text style={styles.unavailableDatesTitle}>Already Booked:</Text>
                                {bookedDates.map(b => (
                                    <Text key={b.id} style={styles.unavailableDateRange}>
                                        • {new Date(b.start_date).toLocaleDateString()} to {new Date(b.end_date).toLocaleDateString()}
                                    </Text>
                                ))}
                            </View>
                        )}

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
                                    <View style={styles.chargeRow}>
                                        <Text style={styles.chargeLabel}>Rental Fee ({calculateItemizedCharges().days} days)</Text>
                                        <Text style={styles.chargeValue}>${calculateItemizedCharges().rentalFee}</Text>
                                    </View>
                                    <View style={styles.chargeRow}>
                                        <Text style={styles.chargeLabel}>Security Deposit (Refundable)</Text>
                                        <Text style={styles.chargeValue}>${calculateItemizedCharges().deposit}</Text>
                                    </View>
                                    <View style={styles.chargeRow}>
                                        <Text style={styles.chargeLabel}>Service Fee</Text>
                                        <Text style={styles.chargeValue}>${calculateItemizedCharges().serviceFee}</Text>
                                    </View>
                                    <View style={[styles.chargeRow, styles.totalRow]}>
                                        <Text style={styles.totalLabel}>Total</Text>
                                        <Text style={styles.totalValue}>${calculateItemizedCharges().total}</Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.actionButtons}>
                                <TouchableOpacity 
                                    style={styles.contactButton}
                                    onPress={() => requireAuth(
                                        () => router.push(`/conversation/${item.owner_id}?name=${encodeURIComponent(item.owner?.name || 'Owner')}`),
                                        "Please sign in to contact the owner."
                                    )}
                                >
                                    <Text style={styles.contactButtonText}>Contact Owner</Text>
                                </TouchableOpacity>

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
  ownerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chargeLabel: {
    fontSize: 14,
    color: '#666',
  },
  chargeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f95dc',
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
  reviewsSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  noReviews: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  unavailableDatesContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  unavailableDatesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 4,
  },
  unavailableDateRange: {
    fontSize: 13,
    color: '#ef6c00',
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
  actionButtons: {
    gap: 12,
  },
  contactButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2f95dc',
  },
  contactButtonText: {
    color: '#2f95dc',
    fontSize: 16,
    fontWeight: '600',
  },
});