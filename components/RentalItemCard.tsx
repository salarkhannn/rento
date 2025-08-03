import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Text, View } from './Themed';
import { RentalItem } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/queries';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Props {
  item: RentalItem;
}

export function RentalItemCard({ item }: Props) {
  const { mode, user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [item.id, user]);

  const checkWishlistStatus = async () => {
    if (!user || mode !== 'renter') return;
    try {
      const isWishlisted = await isInWishlist(item.id);
      setInWishlist(isWishlisted);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user || mode !== 'renter' || wishlistLoading) return;
    
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(item.id);
        setInWishlist(false);
      } else {
        await addToWishlist(item.id);
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          {/* Show wishlist button only for renters */}
          {mode === 'renter' && user && (
            <TouchableOpacity 
              style={styles.wishlistButton} 
              onPress={handleWishlistToggle}
              disabled={wishlistLoading}
            >
              <FontAwesome 
                name={inWishlist ? "heart" : "heart-o"} 
                size={22} 
                color={inWishlist ? "#FF5252" : "#999"} 
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${item.price}/day</Text>
          <Text style={styles.owner}>by {item.owner?.name || 'Unknown'}</Text>
          {/* Only show manage button for lenders viewing their own items */}
          {mode === 'lender' && user?.id === item.owner_id && (
            <TouchableOpacity
              onPress={() => router.push(`/manage-listing/${item.id}`)}
              style={styles.manageButton}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  wishlistButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
    flex: 1,
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#888',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f95dc',
  },
  owner: {
    fontSize: 12,
    color: '#666',
  },
  manageButton: {
    backgroundColor: '#2f95dc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});