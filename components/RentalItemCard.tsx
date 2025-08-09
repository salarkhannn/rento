import React from 'react';
import { router } from 'expo-router';
import { RentalItem } from '@/lib/supabase';
import Card from '@/ui/components/Card';

interface Props {
  item: RentalItem;
}

export function RentalItemCard({ item }: Props) {
  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  return (
    <Card
      title={item.title}
      price={`$${item.price}/day`}
      hasImage={!!item.image_url}
      imageSource={{ uri: item.image_url }}
      location={item.location}
      onPress={handlePress}
      cta
      onCtaPress={handlePress}
    />
  );
}
