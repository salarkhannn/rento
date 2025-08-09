import React from 'react';
import { router } from 'expo-router';
import { RentalItem } from '@/lib/supabase';
import Card from '@/ui/components/Card';
import { removeFromWishlist } from '@/lib/queries';

interface Props {
  item: RentalItem;
  onRemove?: (itemId: string) => void;
}

export function WishlistItemCard({ item, onRemove }: Props) {
  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  const handleRemoveFromWishlist = async () => {
    try {
      await removeFromWishlist(item.id);
      onRemove?.(item.id);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
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
      orientation='horizontal'
      onPress={handlePress}
      topRightIconName="heart"
      onTopRightIconPress={handleRemoveFromWishlist}
      isTopRightIconActive={true}
    />
  );
}
