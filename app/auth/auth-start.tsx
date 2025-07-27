
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';

export default function AuthStartScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const checkEmail = async () => {
    setLoading(true);
    try {
      console.log('AuthStart: Checking email:', email.toLowerCase());
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      console.log('AuthStart: Supabase check result - data:', data, 'error:', error);

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        Alert.alert('Error', error.message);
        return;
      }

      if (data) {
        console.log('AuthStart: Email exists, routing to login.');
        router.push({ pathname: '/auth/auth-login', params: { email } });
      } else {
        console.log('AuthStart: Email does not exist, routing to signup.');
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

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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
          <Text style={styles.socialButtonText}>Continue with Phone</Text>
        </TouchableOpacity>
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
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2f95dc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialButtonsContainer: {
    marginTop: 20,
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
