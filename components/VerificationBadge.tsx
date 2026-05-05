import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface VerificationBadgeProps {
  size?: number;
  style?: any;
}

export default function VerificationBadge({ size = 16, style }: VerificationBadgeProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="checkmark-circle" size={size} color={Colors.brand.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
