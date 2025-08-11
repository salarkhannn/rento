import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/lib/AuthContext';
import { getProfile } from '@/lib/queries';
import { Profile } from '@/lib/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import Button from '@/ui/components/Button';

export default function ProfileScreen() {
  const { user, signOut, mode, switchMode, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    // Create a simple edit profile modal or page
    Alert.alert('Feature Coming Soon', 'Profile editing will be available in a future update.');
  };

  const handleBookings = () => {
    router.push('/(tabs)/bookings');
  };

  const handleWishlist = () => {
    router.push('/(tabs)/wishlist');
  };

  const handleNotifications = () => {
    router.push('/(tabs)/notifications');
  };

  const handleSwitchMode = async () => {
    try {
      await switchMode();
    } catch (error) {
      Alert.alert('Error', 'Failed to switch mode. Please try again.');
    }
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement profile deletion
            Alert.alert('Feature Coming Soon', 'Profile deletion will be available in a future update.');
          }
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setSigningOut(false);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.userName}>
          {profile?.name || 'John Doe'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email || 'johndoe@example.com'}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionItem} onPress={handleBookings}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="calendar-outline" size={24} color={Colors.brand.primary} />
          </View>
          <Text style={styles.quickActionLabel}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionItem} onPress={handleWishlist}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="heart-outline" size={24} color={Colors.brand.primary} />
          </View>
          <Text style={styles.quickActionLabel}>Wishlist</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionItem} onPress={handleNotifications}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="notifications-outline" size={24} color={Colors.brand.primary} />
          </View>
          <Text style={styles.quickActionLabel}>Notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Switch */}
      <View style={styles.section}>
        <Button
          title={mode === 'renter' ? 'Switch to lender' : 'Switch to renter'}
          onPress={handleSwitchMode}
          disabled={authLoading}
        />
      </View>

      {/* Profile Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.outlineButton} onPress={handleEditProfile}>
          <Text style={styles.outlineButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Profile */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
          <Text style={styles.deleteButtonText}>Delete Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },
  loadingText: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
    marginTop: 10,
  },
  header: {
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.title2Emphasized,
    color: Colors.text.secondary,
  },
  userName: {
    ...typography.title2Emphasized,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    ...typography.caption1Regular,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.background.primary,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.brand.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  outlineButtonText: {
    ...typography.calloutEmphasized,
    color: Colors.brand.primary,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    ...typography.calloutEmphasized,
    color: '#ffffff',
  },
});
