
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/lib/AuthContext';
import { getLenderBookings, updateBookingStatus } from '@/lib/queries';
import { Booking } from '@/lib/supabase';
import { PaymentStatusBadge } from '@/components/PaymentStatusBadge';

export default function LenderBookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getLenderBookings(user.id);
      setBookings(data);
    } catch {
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    bookingId: string,
    action: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ) => {
    setActionLoading(bookingId);
    try {
      await updateBookingStatus(bookingId, action);
      await loadBookings();
    } catch {
      Alert.alert('Error', `Failed to ${action.toLowerCase()} booking`);
    } finally {
      setActionLoading(null);
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.itemTitle}>{item.item?.title ?? 'Item'}</Text>
      <Text>Renter: {item.renter?.name ?? item.renter_id}</Text>
      <Text>
        Dates: {item.start_date} - {item.end_date}
      </Text>
      <Text>
        Status: <Text style={{ fontWeight: 'bold' }}>{item.status}</Text>
      </Text>
      <View style={styles.paymentRow}>
        <PaymentStatusBadge status={item.payment_status} />
      </View>
      {item.status === 'PENDING' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleAction(item.id, 'CONFIRMED')}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.actionButtonText}>
              {actionLoading === item.id ? 'Approving...' : 'Approve'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF5252' }]}
            onPress={() => handleAction(item.id, 'CANCELLED')}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.actionButtonText}>
              {actionLoading === item.id ? 'Rejecting...' : 'Reject'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'CONFIRMED' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => handleAction(item.id, 'COMPLETED')}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.actionButtonText}>
              {actionLoading === item.id ? 'Completing...' : 'Mark Completed & Release Funds'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f95dc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={renderBooking}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No bookings for your items yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  bookingCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  paymentRow: { marginTop: 8 },
  actions: { flexDirection: 'row', marginTop: 12 },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

