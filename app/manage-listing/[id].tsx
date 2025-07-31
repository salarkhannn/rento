import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { getRentalItem, getListingBookings, updateBookingStatus, deleteRentalItem } from '@/lib/queries';
import { RentalItem, Booking } from '@/lib/supabase';
import { handleBookingStatusChange, handleListingDeletion } from '@/lib/notificationQueries';
import { scheduleLocalNotification } from '@/lib/notifications';
import { ModeGuard } from '../guards/ModeGuard';

export default function ManageListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<RentalItem | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      const [itemData, bookingsData] = await Promise.all([
        getRentalItem(id),
        getListingBookings(id)
      ]);
      
      setItem(itemData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
      try {
          await updateBookingStatus(bookingId, 'CONFIRMED');
          
          // Send notification to database
          await handleBookingStatusChange(bookingId, 'CONFIRMED');

          // Show local notification for immediate feedback
          await scheduleLocalNotification(
              '✅ Booking Approved',
              'You have successfully approved a booking request',
              1,
              { 
                  booking_id: bookingId,
                  action: 'booking_approved'
              }
          );

          loadData();
          Alert.alert('Success', 'Booking approved successfully');
      } catch (error) {
          console.error('Error approving booking:', error);
          Alert.alert('Error', 'Failed to approve booking');
      }
  };

  const handleRejectBooking = async (bookingId: string) => {
      Alert.alert(
          'Reject Booking',
          'Are you sure you want to reject this booking?',
          [
              { text: 'Cancel' },
              {
                  text: 'Reject',
                  onPress: async () => {
                      try {
                          await updateBookingStatus(bookingId, 'CANCELLED');
                          await handleBookingStatusChange(bookingId, 'CANCELLED');

                          // Show local notification
                          await scheduleLocalNotification(
                              '❌ Booking Rejected',
                              'You have rejected a booking request',
                              1,
                              { 
                                  booking_id: bookingId,
                                  action: 'booking_rejected'
                              }
                          );

                          loadData();
                          Alert.alert('Success', 'Booking rejected successfully');
                      } catch (error) {
                          console.error('Error rejecting booking:', error);
                          Alert.alert('Error', 'Failed to reject booking');
                      }
                  }
              }
          ]
      );
  };

  const handleEditListing = () => {
    router.push(`/edit-listing/${id}`);
  };

  const handleDeleteListing = async () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteListing
        }
      ]
    );
  };

  const confirmDeleteListing = async () => {
      try {
          await handleListingDeletion(id!);
          await deleteRentalItem(id!);

          // Show local notification
          await scheduleLocalNotification(
              '🗑️ Listing Deleted',
              'Your listing has been successfully deleted',
              1,
              { 
                  item_id: id!,
                  action: 'listing_deleted'
              }
          );

          Alert.alert('Success', 'Listing deleted successfully', [
              {
                  text: 'OK',
                  onPress: () => router.push('/my-listings')
              }
          ]);
      } catch (error) {
          console.error('Error deleting listing:', error);
          Alert.alert('Error', 'Failed to delete listing');
      }
  };

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <Text>Listing not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ModeGuard requiredMode='lender'>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>${item.price}/day</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Details</Text>
          <Text style={styles.detail}>Category: {item.category}</Text>
          <Text style={styles.detail}>Location: {item.location}</Text>
          <Text style={styles.detail}>Status: {item.is_available ? 'Available' : 'Unavailable'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Requests ({bookings.length})</Text>
          {bookings.length === 0 ? (
            <Text style={styles.emptyText}>No booking requests yet</Text>
          ) : (
            bookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <Text style={styles.bookingTitle}>
                  {booking.renter?.name || 'Unknown User'}
                </Text>
                <Text style={styles.bookingDates}>
                  {booking.start_date} → {booking.end_date}
                </Text>
                <Text style={styles.bookingPrice}>
                  Total: ${booking.total_price}
                </Text>
                <Text style={[styles.bookingStatus, { color: getStatusColor(booking.status) }]}>
                  Status: {booking.status}
                </Text>
                {booking.status === 'PENDING' && (
                  <View>
                    <TouchableOpacity
                      onPress={() => handleApproveBooking(booking.id)}
                    >
                      <Text>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRejectBooking(booking.id)}
                    >
                      <Text>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}

        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditListing}
          >
            <Text style={styles.buttonText}>Edit Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteListing}
          >
            <Text style={styles.buttonText}>Delete Listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ModeGuard>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'CONFIRMED': return '#4CAF50';
    case 'PENDING': return '#FF9800';
    case 'CANCELLED': return '#F44336';
    case 'COMPLETED': return '#2196F3';
    default: return '#666';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2f95dc',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detail: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bookingCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingDates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingPrice: {
    fontSize: 14,
    color: '#2f95dc',
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  editButton: {
    backgroundColor: '#2f95dc',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
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