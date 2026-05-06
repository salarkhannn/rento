import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { getMyBookings, updateBookingStatus } from '@/lib/queries';
import { Booking } from '@/lib/supabase';
import { handleBookingStatusChange } from '@/lib/notificationQueries';
import { scheduleLocalNotification } from '@/lib/notifications';
import { ConditionalAuthGuard } from '@/components/ConditionalAuthGuard';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import Button from '@/ui/components/Button';
import Card from '@/ui/components/Card';
import { useAuth } from '@/lib/AuthContext';

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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
    if (user) {
      loadBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [user]);

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

  const calculateLateFee = (booking: Booking) => {
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') return 0;
    
    const endDate = new Date(booking.end_date);
    const now = new Date();
    
    if (now > endDate) {
      const diffTime = Math.abs(now.getTime() - endDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const lateFeePerDay = booking.item?.late_fee_per_day || 10;
      return diffDays * lateFeePerDay;
    }
    return 0;
  };

  const renderBooking = ({ item: booking }: { item: Booking }) => {
    const lateFee = calculateLateFee(booking);
    const isPastStart = new Date() >= new Date(booking.start_date);
    const isPastEnd = new Date() >= new Date(booking.end_date);

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{booking.item?.title || 'Unknown Item'}</Text>
            {lateFee > 0 && (
              <View style={styles.lateFeeBadge}>
                <Text style={styles.lateFeeText}>Late Fee: ${lateFee}</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>

        <Text style={styles.dates}>
          📅 {new Date(booking.start_date).toLocaleDateString()} → {new Date(booking.end_date).toLocaleDateString()}
        </Text>

        <Text style={styles.location}>
          📍 {booking.item?.location || 'Unknown location'}
        </Text>

        <View style={styles.bookingFooter}>
          <Text style={styles.price}>💰 ${booking.total_price + lateFee}</Text>
          
          <View style={styles.actionRow}>
            {booking.status === 'PENDING' && (
              <Button
                title="Cancel"
                onPress={() => handleCancelBooking(booking)}
                variant="filled"
                size="small"
                color="bw"
                style={styles.cancelButton}
              />
            )}

            {booking.status === 'APPROVED' && (
              <>
                {!booking.check_in_photos?.length ? (
                  <Button
                    title="Check-in"
                    onPress={() => router.push({
                      pathname: '/booking/[id]/verify',
                      params: { id: booking.id, type: 'check_in' }
                    })}
                    variant="outline"
                    size="small"
                    color="colored"
                  />
                ) : !booking.check_out_photos?.length && isPastEnd && (
                  <Button
                    title="Check-out"
                    onPress={() => router.push({
                      pathname: '/booking/[id]/verify',
                      params: { id: booking.id, type: 'check_out' }
                    })}
                    variant="outline"
                    size="small"
                    color="colored"
                  />
                )}
                
                <TouchableOpacity 
                  style={styles.reportButton}
                  onPress={() => Alert.alert('Report Issue', 'This will open a dispute with the owner. Proceed?', [
                    { text: 'Cancel' },
                    { text: 'Report', onPress: () => Alert.alert('Submitted', 'Dispute ticket created.') }
                  ])}
                >
                  <Ionicons name="warning-outline" size={20} color={Colors.colors.red} />
                </TouchableOpacity>
              </>
            )}

            {booking.status === 'COMPLETED' && (
              <Button
                title="Leave Review"
                onPress={() => router.push({
                  pathname: '/booking/[id]/review',
                  params: { id: booking.id }
                })}
                variant="filled"
                size="small"
                color="colored"
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <ConditionalAuthGuard 
      requireAuth={true} 
      message="Please sign in to view your bookings."
    >
      <View style={styles.container}>
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
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
    </ConditionalAuthGuard>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED': return Colors.colors.green;
    case 'PENDING': return Colors.colors.orange;
    case 'CANCELLED': return Colors.colors.red;
    case 'COMPLETED': return Colors.colors.blue;
    default: return Colors.text.secondary;
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerContainer: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    ...typography.title1Medium,
    color: Colors.text.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
    marginTop: 10,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: 20,
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
    ...typography.calloutEmphasized,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption1Emphasized,
    color: Colors.background.primary,
  },
  dates: {
    ...typography.subheadlineRegular,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  location: {
    ...typography.subheadlineRegular,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...typography.calloutEmphasized,
    color: Colors.brand.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff0f0',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: Colors.colors.red,
  },
  messageContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
  },
  messageLabel: {
    ...typography.caption1Emphasized,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  messageText: {
    ...typography.subheadlineRegular,
    color: Colors.text.primary,
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
    ...typography.headlineSemibold,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.subheadlineRegular,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});