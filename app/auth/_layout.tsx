import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth-start" />
      <Stack.Screen name="auth-login" />
      <Stack.Screen name="auth-signup" />
    </Stack>
  );
}