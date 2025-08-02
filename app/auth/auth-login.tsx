
import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import CustomTextInput from '@/ui/components/InputField';
import CustomButton from '@/ui/components/Button';
import { typography } from '@/ui/typography';

export default function AuthLoginScreen() {
  const { email: initialEmail } = useLocalSearchParams();
  const [email, setEmail] = useState((initialEmail as string) ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{...typography.title1Medium, textAlign: 'left'}}>Welcome back to rento!</Text>

      <CustomTextInput
        title='Email'
        value={email}
        onChangeText={setEmail}
        editable={true}
        containerStyle={{ width: '100%' }}
        placeholder="Email"
      />

      <CustomTextInput
        title='Password'
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={{ width: '100%' }}
      />

      <CustomButton
        title="Sign In"
        onPress={signIn}
        disabled={loading}
        loading={loading}
        size="medium"
        variant="filled"
        color="colored"
        style={{ width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 35,
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    gap: 11,
  },
  title: {
    fontFamily: 'SF Pro',
    fontSize: 28,
    letterSpacing: 0,
    fontWeight: 'medium',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
