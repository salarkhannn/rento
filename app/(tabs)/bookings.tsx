import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getMyBookings, updateBookingStatus } from '@/lib/queries';
import { Booking } from '@/lib/supabase';
import { handleBookingStatusChange } from '@/lib/notificationQueries';
import { scheduleLocalNotification } from '@/lib/notifications';
import { ModeGuard } from '../guards/ModeGuard';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelBooking = (booking: Booking) => {
    if (booking.status !== 'PENDING') {
      Alert.alert('Cannot Cancel', 'You can only cancel bookings that are pending.');
      return;
    }

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => cancelBooking(booking.id)
        },
      ]
    )
  };

  const cancelBooking = async (bookingId: string) => {
      try {
          await updateBookingStatus(bookingId, 'CANCELLED');
          await handleBookingStatusChange(bookingId, 'CANCELLED');

          // Show local notification
          await scheduleLocalNotification(
              '🚫 Booking Cancelled',
              'Your booking has been successfully cancelled',
              1,
              { 
                  booking_id: bookingId,
                  action: 'booking_cancelled'
              }
          );

          loadBookings();
          Alert.alert('Success', 'Booking has been cancelled successfully.');
      } catch (error) {
          console.error('Error cancelling booking:', error);
          Alert.alert('Error', 'Failed to cancel booking. Please try again later.');
      }
  };

  const renderBooking = ({ item: booking }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.itemTitle}>{booking.item?.title || 'Unknown Item'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      <Text style={styles.dates}>
        📅 {booking.start_date} → {booking.end_date}
      </Text>

      <Text style={styles.location}>
        📍 {booking.item?.location || 'Unknown location'}
      </Text>

      <View style={styles.bookingFooter}>
        <Text style={styles.price}>💰 ${booking.total_price}</Text>
        
        {booking.status === 'PENDING' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(booking)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2f95dc" />
        <Text>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <ModeGuard requiredMode='renter'>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>{bookings.length} booking(s)</Text>
        </View>
        
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No bookings yet</Text>
              <Text style={styles.emptySubtext}>Browse items to make your first booking!</Text>
            </View>
          }
        />
      </View>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f95dc',
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messageContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});