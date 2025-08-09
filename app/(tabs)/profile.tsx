import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/lib/AuthContext';
import { getProfile } from '@/lib/queries';
import { Profile } from '@/lib/supabase';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut, mode, switchMode, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
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
    }
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
              // Navigation will be handled by AuthGuard
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

  const getSwitchLabel = () => {
    if (mode === 'renter') return 'Switch to Lender Mode';
    if (mode === 'lender') return 'Switch to Renter Mode';
    return 'Switch Mode';
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.modeText}>Current Mode: {mode?.charAt(0).toUpperCase() + mode?.slice(1)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeSwitchButton}
          onPress={switchMode}
          disabled={loading}
        >
          <Text style={styles.modeSwitchText}>
            {loading ? 'Switching...' : getSwitchLabel()}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.signOutButton, signingOut && styles.signOutButtonDisabled]} 
        onPress={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? (
          <View style={styles.signOutContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.signOutText}>Signing Out...</Text>
          </View>
        ) : (
          <Text style={styles.signOutText}>Sign Out</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  modeText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modeSwitchButton: {
    marginTop: 16,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeSwitchText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#FF5252',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonDisabled: {
    backgroundColor: '#FFAB91',
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});