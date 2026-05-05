import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import Button from '@/ui/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { createBooking } from '@/lib/queries';
import { useAuth } from '@/lib/AuthContext';
import { handleBookingRequest } from '@/lib/notificationQueries';
import { scheduleLocalNotification } from '@/lib/notifications';

export default function PaymentScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  const itemId = params.itemId as string;
  const startDate = params.startDate as string;
  const endDate = params.endDate as string;
  const rentalFee = parseFloat(params.rentalFee as string);
  const deposit = parseFloat(params.deposit as string);
  const serviceFee = parseFloat(params.serviceFee as string);
  const total = parseFloat(params.total as string);
  const itemTitle = params.itemTitle as string;
  const ownerId = params.ownerId as string;
  const autoAccept = params.autoAccept === 'true';

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      Alert.alert('Error', 'Please fill in all payment details');
      return;
    }

    setProcessing(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const booking = await createBooking({
        item_id: itemId,
        renter_id: user!.id,
        start_date: startDate,
        end_date: endDate,
        total_price: total,
        status: autoAccept ? 'CONFIRMED' : 'PENDING',
        payment_status: 'escrow'
      } as any);

      // Send notification
      await handleBookingRequest(booking.id, itemId, user!.id);

      await scheduleLocalNotification(
        '🎉 Payment Successful!',
        autoAccept 
          ? `Your booking for "${itemTitle}" is confirmed!` 
          : `Your request for "${itemTitle}" has been sent to the owner.`,
        2,
        { booking_id: booking.id, item_id: itemId }
      );

      Alert.alert(
        'Success',
        autoAccept 
          ? 'Payment successful! Your booking is confirmed.' 
          : 'Payment successful! Your request has been sent to the owner.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/bookings') }]
      );
    } catch (error) {
      console.error('Payment/Booking error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{itemTitle}</Text>
          <Text style={styles.summaryValue}>${rentalFee}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Security Deposit</Text>
          <Text style={styles.summaryValue}>${deposit}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service Fee</Text>
          <Text style={styles.summaryValue}>${serviceFee}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total to Pay</Text>
          <Text style={styles.totalValue}>${total}</Text>
        </View>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Card Details (Simulated)</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="0000 0000 0000 0000"
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={setCardNumber}
            maxLength={16}
          />
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              keyboardType="numeric"
              value={expiry}
              onChangeText={setExpiry}
              maxLength={5}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="000"
              keyboardType="numeric"
              secureTextEntry
              value={cvv}
              onChangeText={setCvv}
              maxLength={3}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={16} color={Colors.text.secondary} />
          <Text style={styles.securityText}>Secure simulated payment via Rento Escrow</Text>
        </View>
        <Button
          title={processing ? 'Processing...' : `Pay $${total}`}
          onPress={handlePayment}
          disabled={processing}
          loading={processing}
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
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  title: {
    ...typography.title2Emphasized,
  },
  sectionTitle: {
    ...typography.headlineMedium,
    marginBottom: 16,
  },
  summarySection: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
  },
  summaryValue: {
    ...typography.bodyEmphasized,
    color: Colors.text.primary,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    ...typography.bodyEmphasized,
    fontSize: 18,
  },
  totalValue: {
    ...typography.title3Emphasized,
    color: Colors.brand.primary,
  },
  paymentSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...typography.caption1Medium,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 40,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  securityText: {
    ...typography.caption1Regular,
    color: Colors.text.secondary,
  },
});
