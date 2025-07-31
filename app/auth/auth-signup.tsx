
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import CustomTextInput from '@/ui/components/InputField';

export default function AuthSignUpScreen() {
  const { email: initialEmail } = useLocalSearchParams();
  const [email] = useState(initialEmail as string || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(''); // YYYY-MM-DD format
  const [showDatePicker, setShowDatePicker] = useState(false);
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
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Rento today</Text>

      <CustomTextInput
        title='Email'
        value={email}
        editable={false}
        containerStyle={{ width: '100%', marginBottom: 15 }}
      />

      <CustomTextInput
        title='First Name'
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        containerStyle={{ width: '100%', marginBottom: 15 }}
      />

      <CustomTextInput
        title='Last Name'
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        containerStyle={{ width: '100%', marginBottom: 15 }}
      />

      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center' }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={dob ? styles.dateText : styles.placeholderText}>
          {dob || "Date of Birth (YYYY-MM-DD)"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dob ? new Date(dob) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDob(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}

      <CustomTextInput
        title='Password'
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={{ width: '100%', marginBottom: 15 }}
      />

      <Text style={styles.termsText}>
        By clicking "Agree and Continue", you agree to our Terms of Service, Payment Terms, and Privacy Policy.
      </Text>

      <TouchableOpacity 
        style={[styles.button, { opacity: loading ? 0.5 : 1 }]} 
        onPress={signUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Agree and Continue'}
        </Text>
      </TouchableOpacity>
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
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
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
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#c7c7cd',
  },
});
