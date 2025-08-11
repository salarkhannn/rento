
import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import CustomTextInput from '@/ui/components/InputField';
import CustomButton from '@/ui/components/Button';
import { typography } from '@/ui/typography';

export default function AuthStartScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkEmail = async () => {
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    } else {
      setError('');
    }
    setLoading(true);
    try {
      // Temporarily commented out to bypass login/signup
      const { data, error } = await supabase
        .rpc('check_user_exists', { input_email: email.toLowerCase().trim() });

      if (error) {
        console.error('AuthStart: Supabase RPC error:', error);
        Alert.alert('Error', 'Unable to verify email.');
        return; // commented out to bypass but check if the user exists
      }
      // let data = true;
      // console.log('Bypassing email check, assuming user exists:');
      if (data === true) {
        router.push({ pathname: '/auth/auth-login', params: { email } });
      } else {
        router.push({ pathname: '/auth/auth-signup', params: { email } });
      }

    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={typography.title1Medium}>Welcome to Rento</Text>

      <CustomTextInput
        title='Email'
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        errorMessage={error}
        helperText=""
        containerStyle={{ width: '100%', marginBottom: 15 }}
      />

      <CustomButton
        title="Continue with Email"
        onPress={checkEmail}
        disabled={loading}
        loading={loading}
        size="medium"
        variant="filled"
        color="colored"
        style={{ width: '100%', marginBottom: 15 }}
      />

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.text}>or</Text>
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 35,
    alignItems: 'center',
    backgroundColor: '#F7F7F7'
  },
  title: {
    fontFamily: 'SF Pro',
    fontSize: 28,
    letterSpacing: 0,
    fontWeight: 'medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  socialButtonsContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
    backgroundColor: '#F7F7F7',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#B0B0B0', // grey tone similar to the image
  },
  text: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#B0B0B0',
    fontFamily: 'SF Pro',
  },
});
