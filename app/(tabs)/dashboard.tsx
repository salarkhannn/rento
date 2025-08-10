import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/lib/AuthContext';
import { getMyListings, getLenderBookings } from '@/lib/queries';
import { RentalItem, Booking } from '@/lib/supabase';
import { ModeGuard } from '../guards/ModeGuard';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import Button from '@/ui/components/Button';
import Card from '@/ui/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  pendingBookings: number;
  monthlyEarnings: number;
  totalEarnings: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [topListings, setTopListings] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      const [listings, bookings] = await Promise.all([
        getMyListings(),
        getLenderBookings(user.id),
      ]);

      // Calculate stats
      const activeListings = listings.filter(item => item.is_available).length;
      const pendingBookings = bookings.filter(booking => booking.status === 'PENDING').length;
      
      // Calculate earnings
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyEarnings = bookings
        .filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear &&
                 (booking.status === 'COMPLETED' || booking.status === 'CONFIRMED');
        })
        .reduce((sum, booking) => sum + Number(booking.total_price), 0);

      const totalEarnings = bookings
        .filter(booking => booking.status === 'COMPLETED' || booking.status === 'CONFIRMED')
        .reduce((sum, booking) => sum + Number(booking.total_price), 0);

      setStats({
        totalListings: listings.length,
        activeListings,
        totalBookings: bookings.length,
        pendingBookings,
        monthlyEarnings,
        totalEarnings,
      });

      // Set recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5));
      
      // Set top performing listings (for now, just take first 3)
      setTopListings(listings.slice(0, 3));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const StatCard = ({ title, value, subtitle, color, icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const QuickActionCard = ({ title, subtitle, icon, onPress, color }: {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ModeGuard requiredMode="lender">
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.headerTitle}>Dashboard Overview</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Active Listings"
              value={stats.activeListings}
              subtitle={`${stats.totalListings} total`}
              color={Colors.colors.green}
              icon="storefront"
            />
            <StatCard
              title="Pending Requests"
              value={stats.pendingBookings}
              subtitle="Need response"
              color={Colors.colors.orange}
              icon="time"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="This Month"
              value={`$${stats.monthlyEarnings}`}
              subtitle="Earnings"
              color={Colors.brand.primary}
              icon="trending-up"
            />
            <StatCard
              title="Total Earned"
              value={`$${stats.totalEarnings}`}
              subtitle="All time"
              color={Colors.colors.purple}
              icon="wallet"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="New Listing"
              subtitle="Add item to rent"
              icon="add-circle"
              color={Colors.colors.green}
              onPress={() => router.push('/create-item')}
            />
            <QuickActionCard
              title="My Listings"
              subtitle="Manage items"
              icon="list"
              color={Colors.brand.primary}
              onPress={() => router.push('/my-listings')}
            />
            <QuickActionCard
              title="Bookings"
              subtitle="View requests"
              icon="calendar"
              color={Colors.colors.orange}
              onPress={() => router.push('/(tabs)/lender-bookings')}
            />
            <QuickActionCard
              title="Messages"
              subtitle="Chat with renters"
              icon="chatbubbles"
              color={Colors.colors.blue}
              onPress={() => router.push('/(tabs)/messages')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        {stats.pendingBookings > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/lender-bookings')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.alertCard}>
              <Ionicons name="warning" size={24} color={Colors.colors.orange} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {stats.pendingBookings} booking{stats.pendingBookings > 1 ? 's' : ''} awaiting response
                </Text>
                <Text style={styles.alertSubtitle}>
                  Respond quickly to improve your rating
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/lender-bookings')}>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/lender-bookings')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentBookings.slice(0, 3).map((booking) => (
              <View key={booking.id} style={styles.bookingItem}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTitle}>{booking.item?.title}</Text>
                  <Text style={styles.bookingDates}>
                    {booking.start_date} → {booking.end_date}
                  </Text>
                </View>
                <View style={styles.bookingRight}>
                  <Text style={styles.bookingPrice}>${booking.total_price}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text style={styles.statusText}>{booking.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="analytics" size={24} color={Colors.brand.primary} />
              <Text style={styles.insightTitle}>This Month's Performance</Text>
            </View>
            <View style={styles.insightStats}>
              <View style={styles.insightStat}>
                <Text style={styles.insightValue}>{stats.totalBookings}</Text>
                <Text style={styles.insightLabel}>Total Bookings</Text>
              </View>
              <View style={styles.insightStat}>
                <Text style={styles.insightValue}>{Math.round((stats.activeListings / Math.max(stats.totalListings, 1)) * 100)}%</Text>
                <Text style={styles.insightLabel}>Active Rate</Text>
              </View>
              <View style={styles.insightStat}>
                <Text style={styles.insightValue}>${Math.round(stats.monthlyEarnings / Math.max(stats.activeListings, 1))}</Text>
                <Text style={styles.insightLabel}>Avg per Item</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Empty State */}
        {stats.totalListings === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={64} color={Colors.text.disabled} />
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first listing to start earning
            </Text>
            <Button
              title="Create First Listing"
              onPress={() => router.push('/create-item')}
              variant="filled"
              size="medium"
              style={styles.createButton}
            />
          </View>
        )}
      </ScrollView>
    </ModeGuard>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'CONFIRMED': return Colors.colors.green;
    case 'PENDING': return Colors.colors.orange;
    case 'CANCELLED': return Colors.colors.red;
    case 'COMPLETED': return Colors.colors.blue;
    default: return Colors.text.secondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
    marginTop: 10,
  },
  header: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  welcomeText: {
    ...typography.subheadlineRegular,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  headerTitle: {
    ...typography.title1Medium,
    color: Colors.text.primary,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    ...typography.title2Emphasized,
    color: Colors.text.primary,
  },
  statTitle: {
    ...typography.calloutEmphasized,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  statSubtitle: {
    ...typography.caption1Regular,
    color: Colors.text.secondary,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.title3Emphasized,
    color: Colors.text.primary,
  },
  seeAllText: {
    ...typography.calloutRegular,
    color: Colors.brand.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    ...typography.calloutEmphasized,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    ...typography.caption1Regular,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: Colors.background.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.colors.orange,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    ...typography.calloutEmphasized,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  alertSubtitle: {
    ...typography.caption1Regular,
    color: Colors.text.secondary,
  },
  bookingItem: {
    backgroundColor: Colors.background.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    ...typography.calloutEmphasized,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  bookingDates: {
    ...typography.caption1Regular,
    color: Colors.text.secondary,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  bookingPrice: {
    ...typography.calloutEmphasized,
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    ...typography.caption2Emphasized,
    color: Colors.background.primary,
  },
  insightCard: {
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightTitle: {
    ...typography.calloutEmphasized,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  insightStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  insightStat: {
    alignItems: 'center',
  },
  insightValue: {
    ...typography.title3Emphasized,
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  insightLabel: {
    ...typography.caption1Regular,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    ...typography.title3Emphasized,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    minWidth: 200,
  },
});