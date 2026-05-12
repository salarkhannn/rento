import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
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
    }
    setError('');

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
    } catch (e) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.form}>
        <Text style={[typography.title1Medium, styles.heading]}>Welcome to Rento</Text>

        <CustomTextInput
          title="Email"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          errorMessage={error}
          helperText=""
          containerStyle={styles.field}
        />

        <CustomButton
          title="Continue with Email"
          onPress={checkEmail}
          disabled={loading}
          loading={loading}
          size="medium"
          variant="filled"
          color="colored"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 35,
    paddingVertical: 24,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  field: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
});
