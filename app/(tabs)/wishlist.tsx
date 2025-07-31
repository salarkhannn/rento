import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { RentalItemCard } from '@/components/RentalItemCard';
import { RentalItem } from '@/lib/supabase';
// import { getWishlistItems } from '@/lib/queries'; // For future implementation

export default function WishlistScreen() {
  // Placeholder: Replace with real data fetching later
  const [wishlist, setWishlist] = useState<RentalItem[]>([]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist</Text>
      {wishlist.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Your saved items will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <RentalItemCard item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', margin: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888', marginTop: 24 },
});