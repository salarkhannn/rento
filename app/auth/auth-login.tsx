import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import CustomTextInput from '@/ui/components/InputField';
import CustomButton from '@/ui/components/Button';
import { typography } from '@/ui/typography';

export default function AuthLoginScreen() {
  const { email: initialEmail } = useLocalSearchParams();
  const [email, setEmail] = useState((initialEmail as string) ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const checkLockout = async (email: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('locked_until, failed_login_attempts')
      .eq('email', email)
      .single();

    if (data && data.locked_until) {
      const lockedUntil = new Date(data.locked_until);
      if (lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((lockedUntil.getTime() - new Date().getTime()) / 60000);
        return { isLocked: true, remainingMinutes };
      }
    }
    return { isLocked: false, attempts: data?.failed_login_attempts || 0 };
  };

  const handleFailure = async (email: string, currentAttempts: number) => {
    const newAttempts = currentAttempts + 1;
    const updates: any = { failed_login_attempts: newAttempts };

    if (newAttempts >= 5) {
      const lockoutTime = new Date();
      lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
      updates.locked_until = lockoutTime.toISOString();
    }

    await supabase.from('profiles').update(updates).eq('email', email);

    if (newAttempts >= 5) {
      Alert.alert('Account Locked', 'Too many failed attempts. Account locked for 15 minutes.');
    } else {
      Alert.alert('Error', `Invalid email or password. ${5 - newAttempts} attempts remaining.`);
    }
  };

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const { isLocked, remainingMinutes, attempts } = await checkLockout(email);

      if (isLocked) {
        Alert.alert('Account Locked', `Please try again in ${remainingMinutes} minutes.`);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        await handleFailure(email, attempts);
      } else {
        await supabase
          .from('profiles')
          .update({ failed_login_attempts: 0, locked_until: null })
          .eq('email', email);

        router.replace('/(tabs)');
      }
    } catch (e) {
      console.error('Login error:', e);
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
        <Text style={[typography.title1Medium, styles.heading]}>Welcome back to rento!</Text>

        <CustomTextInput
          title="Email"
          value={email}
          onChangeText={setEmail}
          editable
          containerStyle={styles.field}
          placeholder="Email"
        />

        <CustomTextInput
          title="Password"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={styles.field}
        />

        <CustomButton
          title="Sign In"
          onPress={signIn}
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
    alignItems: 'stretch',
    gap: 12,
  },
  heading: {
    textAlign: 'left',
    marginBottom: 12,
  },
  field: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginTop: 4,
  },
});
