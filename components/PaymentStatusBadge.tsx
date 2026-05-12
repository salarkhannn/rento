import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { PaymentStatus } from '@/lib/supabase';

const COPY: Record<PaymentStatus, { label: string; bg: string; fg: string }> = {
  pending: {
    label: 'Payment pending',
    bg: 'rgba(142, 142, 147, 0.15)',
    fg: Colors.text.secondary,
  },
  escrow: {
    label: 'Funds in escrow',
    bg: 'rgba(0, 122, 255, 0.12)',
    fg: Colors.brand.primary,
  },
  released: {
    label: 'Paid to lender',
    bg: 'rgba(52, 199, 89, 0.15)',
    fg: '#1B7A2F',
  },
  refunded: {
    label: 'Refunded',
    bg: 'rgba(255, 149, 0, 0.15)',
    fg: '#995900',
  },
};

interface Props {
  status?: PaymentStatus | null;
}

export function PaymentStatusBadge({ status }: Props) {
  if (!status) return null;
  const copy = COPY[status];
  if (!copy) return null;

  return (
    <View style={[styles.badge, { backgroundColor: copy.bg }]}>
      <Text style={[styles.label, { color: copy.fg }]}>{copy.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
