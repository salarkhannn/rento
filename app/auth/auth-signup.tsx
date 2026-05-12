import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import CustomTextInput from '@/ui/components/InputField';
import CustomButton from '@/ui/components/Button';
import DatePickerField from '@/ui/components/DatePickerField';
import { typography } from '@/ui/typography';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function AuthSignUpScreen() {
  const { email: initialEmail } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [email] = useState((initialEmail as string) || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(''); // YYYY-MM-DD format
  const [password, setPassword] = useState('');
  const [cnicImage, setCnicImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload your ID.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCnicImage(result.assets[0].uri);
    }
  };

  const uploadCnic = async (userId: string, uri: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: `cnic_${userId}.jpg`,
      } as any);

      const filename = `verification/${userId}/cnic.jpg`;
      
      const { error } = await supabase.storage
        .from('rental-images')
        .upload(filename, formData);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('rental-images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('CNIC upload error:', error);
      return null;
    }
  };

  const signUp = async () => {
    if (!email || !password || !firstName || !lastName || !dob || !cnicImage) {
      Alert.alert('Error', 'Please fill in all fields and upload your ID');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            dob: dob,
          },
        },
      });

      if (error) {
        console.error('AuthSignUp: Supabase signUp error:', error);
        Alert.alert('Error', error.message);
      } else if (data.user) {
        // Upload CNIC image
        const cnicUrl = await uploadCnic(data.user.id, cnicImage);
        
        // Update profile with verification status
        if (cnicUrl) {
          await supabase
            .from('profiles')
            .update({
              cnic_url: cnicUrl,
              verification_status: 'pending',
              is_verified: false
            })
            .eq('id', data.user.id);
        }

        Alert.alert(
          'Success',
          'Account created! Please check your email to verify your account. Your identity verification is pending approval.',
          [{ text: 'OK', onPress: () => router.replace('/auth/auth-login') }]
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 16 }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={typography.title1Medium}>Finish signing up</Text>

          <View style={styles.section}>
            <Text style={typography.headlineMedium}>Enter your name</Text>
            <CustomTextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              containerStyle={{ width: '100%' }}
            />
            <CustomTextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              containerStyle={{ width: '100%' }}
            />
            <Text style={styles.helperText}>
              Make sure this matches the name on your government ID.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={typography.headlineMedium}>Date of birth</Text>
            <DatePickerField
              value={dob}
              onDateChange={setDob}
              placeholder="YYYY-MM-DD"
              containerStyle={{ width: '100%' }}
            />
          </View>

          <View style={styles.section}>
            <Text style={typography.headlineMedium}>Government ID</Text>
            <Text style={styles.helperText}>
              Upload a clear photo of your CNIC or Passport for verification.
            </Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {cnicImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: cnicImage }} style={styles.previewImage} />
                  <View style={styles.changeOverlay}>
                    <Ionicons name="camera" size={24} color="#fff" />
                    <Text style={styles.changeText}>Change Photo</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="cloud-upload-outline" size={40} color={Colors.brand.primary} />
                  <Text style={styles.placeholderText}>Upload CNIC Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={typography.headlineMedium}>Password</Text>
            <CustomTextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              containerStyle={{ width: '100%' }}
            />
          </View>

          <Text style={{...typography.caption1Regular, textAlign: 'left' }}>
            By selecting Agree and continue, I agree to rento’s Terms of Services, Payments Terms of Service, and acknowledge the Privacy Policy
          </Text>

          <CustomButton
            title="Agree and Continue"
            onPress={signUp}
            disabled={loading}
            loading={loading}
            size="medium"
            variant="filled"
            color="colored"
            style={{ width: '100%', marginBottom: 40 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 29,
    alignItems: 'center',
  },
  content: {
    backgroundColor: "#F7F7F7",
    width: '100%',
    maxWidth: 500,
    alignItems: 'stretch',
    gap: 18,
  },
  section: {
    backgroundColor: '#F7F7F7',
    alignSelf: 'stretch',
    gap: 6,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'SF Pro',
    color: 'rgba(60,60,67,0.6)',
    alignSelf: 'stretch',
    marginBottom: 4,
  },
  imagePicker: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginTop: 8,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.calloutMedium,
    color: Colors.brand.primary,
    marginTop: 8,
  },
  imageContainer: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeText: {
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
  },
});
