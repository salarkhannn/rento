import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import CustomTextInput from '@/ui/components/InputField';
import CustomButton from '@/ui/components/Button';
import DatePickerField from '@/ui/components/DatePickerField';
import { typography } from '@/ui/typography';

export default function AuthSignUpScreen() {
  const { email: initialEmail } = useLocalSearchParams();
  const [email] = useState((initialEmail as string) || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(''); // YYYY-MM-DD format
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!email || !password || !firstName || !lastName || !dob) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
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
      } else {
        Alert.alert(
          'Success',
          'Account created! Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => router.replace('/auth/auth-login') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 29,
    justifyContent: 'center', // Center vertically
    alignItems: 'center',     // Center horizontally
  },
  content: {
    backgroundColor: "#F7F7F7",
    width: '100%',            // Ensure content does not shrink
    maxWidth: 500,            // Optional: limit max width for larger screens
    alignItems: 'stretch',    // Stretch children to container width
    gap: 18,
  },
  title: {
    fontSize: 28,
    fontFamily: 'SF Pro',
    fontWeight: '500',
    color: '#141414',
    alignSelf: 'stretch',
  },
  section: {
    backgroundColor: '#F7F7F7',
    alignSelf: 'stretch',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'SF Pro',
    fontWeight: '500',
    color: '#141414',
    alignSelf: 'stretch',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'SF Pro',
    color: 'rgba(60,60,67,0.6)',
    alignSelf: 'stretch',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
