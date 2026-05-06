import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { getAdminStats, getRecentBookings } from '@/lib/queries';
import { Booking } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState({ userCount: 0, bookingCount: 0, totalRevenue: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, bookingsData] = await Promise.all([
        getAdminStats(),
        getRecentBookings()
      ]);
      setStats(statsData);
      setRecentBookings(bookingsData);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={24} color={Colors.brand.primary} />
          <Text style={styles.statValue}>{stats.userCount}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cart-outline" size={24} color={Colors.brand.primary} />
          <Text style={styles.statValue}>{stats.bookingCount}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={[styles.statCard, { width: '100%' }]}>
          <Ionicons name="cash-outline" size={24} color="#4CAF50" />
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>${stats.totalRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tools</Text>
        </View>
        <TouchableOpacity 
          style={styles.toolCard}
          onPress={() => router.push('/admin/verification-queue')}
        >
          <View style={styles.toolIcon}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
          </View>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Verification Queue</Text>
            <Text style={styles.toolSubtitle}>Review pending identity verifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toolCard, { marginTop: 12 }]}
          onPress={() => router.push('/admin/disputes')}
        >
          <View style={[styles.toolIcon, { backgroundColor: '#ff3b30' }]}>
            <Ionicons name="warning-outline" size={24} color="#fff" />
          </View>
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Dispute Resolution</Text>
            <Text style={styles.toolSubtitle}>Manage reported issues and appeals</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
        </View>
        {recentBookings.map(booking => (
          <View key={booking.id} style={styles.bookingItem}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingItemTitle} numberOfLines={1}>{booking.item?.title}</Text>
              <Text style={styles.bookingUser}>{booking.renter?.name || 'User'}</Text>
            </View>
            <View style={styles.bookingMeta}>
              <Text style={styles.bookingPrice}>${booking.total_price}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: booking.status === 'CONFIRMED' ? '#e8f5e9' : '#fff3e0' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: booking.status === 'CONFIRMED' ? '#2e7d32' : '#ef6c00' }
                ]}>
                  {booking.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    ...typography.title2Emphasized,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48.5%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  statValue: {
    ...typography.title1Emphasized,
    marginTop: 8,
  },
  statLabel: {
    ...typography.caption1Medium,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.headlineEmphasized,
  },
  toolCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    ...typography.bodyEmphasized,
  },
  toolSubtitle: {
    ...typography.caption1Regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  bookingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  bookingInfo: {
    flex: 1,
    marginRight: 16,
  },
  bookingItemTitle: {
    ...typography.bodyEmphasized,
  },
  bookingUser: {
    ...typography.caption1Regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  bookingMeta: {
    alignItems: 'flex-end',
  },
  bookingPrice: {
    ...typography.bodyEmphasized,
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
