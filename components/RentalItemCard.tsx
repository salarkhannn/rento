import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { RentalItem } from '@/lib/supabase';
import Card from '@/ui/components/Card';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/queries';
import { useAuthAction } from './ConditionalAuthGuard';
import { useAuth } from '@/lib/AuthContext';

interface Props {
  item: RentalItem;
}

export function RentalItemCard({ item }: Props) {
  const { session } = useAuth();
  const { requireAuth } = useAuthAction();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  useEffect(() => {
    const checkIfWishlisted = async () => {
      // Only check wishlist status if user is authenticated
      if (!session) {
        setLoadingWishlist(false);
        return;
      }

      try {
        const wishlisted = await isInWishlist(item.id);
        setIsWishlisted(wishlisted);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      } finally {
        setLoadingWishlist(false);
      }
    };

    checkIfWishlisted();
  }, [item.id, session]);

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  const handleWishlistPress = async () => {
    // Require authentication for wishlist actions
    requireAuth(async () => {
      if (loadingWishlist) return;

      try {
        if (isWishlisted) {
          await removeFromWishlist(item.id);
          setIsWishlisted(false);
        } else {
          await addToWishlist(item.id);
          setIsWishlisted(true);
        }
      } catch (error) {
        console.error('Error updating wishlist:', error);
        // Optionally, revert the state on error
        setIsWishlisted(isWishlisted);
      }
    }, "Please sign in to add items to your wishlist.");
  };

  return (
    <Card
      title={item.title}
      price={`$${item.price}/day`}
      hasImage={!!item.image_url}
      imageSource={{ uri: item.image_url }}
      description={true}
      descriptionText={item.description}
      location={item.location}
      onPress={handlePress}
      cta
      onCtaPress={handlePress}
      topRightIconName={session ? (isWishlisted ? 'heart' : 'heart-outline') : 'heart-outline'}
      onTopRightIconPress={handleWishlistPress}
      isTopRightIconActive={isWishlisted && !!session}
    />
  );
}