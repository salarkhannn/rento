import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { RentalItem } from '@/lib/supabase';
import Card from '@/ui/components/Card';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/queries';

interface Props {
  item: RentalItem;
}

export function RentalItemCard({ item }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  useEffect(() => {
    const checkIfWishlisted = async () => {
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
  }, [item.id]);

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  const handleWishlistPress = async () => {
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
      topRightIconName={isWishlisted ? 'heart' : 'heart-outline'}
      onTopRightIconPress={handleWishlistPress}
      isTopRightIconActive={isWishlisted}
    />
  );
}