
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import CustomTextInput from '@/ui/components/InputField';

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
      const { data, error } = await supabase
        .rpc('check_user_exists', { input_email: email.toLowerCase().trim() });

      if (error) {
        console.error('AuthStart: Supabase RPC error:', error);
        Alert.alert('Error', 'Unable to verify email.');
        return;
      }
      
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
      <Text style={styles.title}>Welcome to Rento</Text>
      <Text style={styles.subtitle}>Enter your email to continue</Text>

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

      <TouchableOpacity 
        style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
        onPress={checkEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Checking...' : 'Continue with Email'}
        </Text>
      </TouchableOpacity>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton} disabled>
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} disabled>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} disabled>
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#2f95dc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialButtonsContainer: {
    marginTop: 20,
    width: '100%',
  },
  socialButton: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  socialButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
