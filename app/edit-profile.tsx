import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/lib/AuthContext';
import { getProfile, updateProfile } from '@/lib/queries';
import { Profile } from '@/lib/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import InputField from '@/ui/components/InputField';
import Button from '@/ui/components/Button';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      // Pre-fill form fields
      setName(data?.name || '');
      setFirstName(data?.first_name || '');
      setLastName(data?.last_name || '');
      setPhone(data?.phone || '');
      setDob(data?.dob || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    // Basic date validation if dob is provided
    if (dob.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      Alert.alert('Validation Error', 'Date of birth must be in YYYY-MM-DD format');
      return;
    }

    setSaving(true);
    try {
      const updates: Partial<Profile> = {
        name: name.trim(),
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        dob: dob.trim() || undefined,
      };

      await updateProfile(updates);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveButtonText, saving && styles.disabledText]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {name.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Display Name *</Text>
            <InputField
              value={name}
              onChangeText={setName}
              placeholder="Enter your display name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <InputField
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <InputField
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <InputField
              value={user?.email || ''}
              editable={false}
              placeholder="Email address"
              style={styles.disabledInput}
            />
            <Text style={styles.helpText}>Email cannot be changed</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <InputField
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <InputField
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.helpText}>Format: YYYY-MM-DD</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={saving || !name.trim()}
            loading={saving}
          />
          
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerButton: {
    width: 60,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.title3Emphasized,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  saveButtonText: {
    ...typography.calloutEmphasized,
    color: Colors.brand.primary,
  },
  disabledText: {
    color: Colors.text.disabled,
  },
  scrollContainer: {
    flex: 1,
  },
  avatarSection: {
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.title1Emphasized,
    color: Colors.text.secondary,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    ...typography.calloutEmphasized,
    color: Colors.brand.primary,
  },
  formContainer: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    ...typography.calloutEmphasized,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  disabledInput: {
    backgroundColor: Colors.background.tertiary,
    color: Colors.text.disabled,
  },
  helpText: {
    ...typography.caption1Regular,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  actionContainer: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.calloutEmphasized,
    color: Colors.text.secondary,
  },
});
