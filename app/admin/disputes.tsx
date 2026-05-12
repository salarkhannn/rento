import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDisputesScreen() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      // Reusing notifications table as a mock dispute storage for KISS
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('title', 'Report Issue') // Identifying disputes by title prefix
        .order('created_at', { ascending: false });

      setDisputes(data || []);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (id: string) => {
    Alert.alert('Resolve Dispute', 'Mark this issue as resolved?', [
      { text: 'Cancel' },
      { 
        text: 'Resolve', 
        onPress: async () => {
          await supabase.from('notifications').delete().eq('id', id);
          loadDisputes();
          Alert.alert('Success', 'Dispute resolved.');
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={disputes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Issue #{item.id.slice(0, 8)}</Text>
              <TouchableOpacity onPress={() => resolveDispute(item.id)} hitSlop={8}>
                <Ionicons name="checkmark-done-circle" size={24} color={Colors.colors.green} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="happy-outline" size={64} color={Colors.text.disabled} />
            <Text style={styles.emptyText}>No active disputes!</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    ...typography.bodyEmphasized,
    color: '#ff3b30',
  },
  cardMessage: {
    ...typography.bodyRegular,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  cardDate: {
    ...typography.caption2Regular,
    color: Colors.text.tertiary,
    marginTop: 12,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...typography.title3Emphasized,
    color: Colors.text.secondary,
    marginTop: 16,
  },
});
