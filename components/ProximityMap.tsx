import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View as RNView } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, View } from '@/components/Themed';
import { RentalItem } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import { router } from 'expo-router';

interface ProximityMapProps {
  items: RentalItem[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export default function ProximityMap({ items, initialRegion }: ProximityMapProps) {
  const defaultRegion = {
    latitude: 33.6844, // Default to Islamabad center if none provided
    longitude: 73.0479,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion || defaultRegion}
        showsUserLocation
      >
        {items.filter(item => item.latitude && item.longitude).map(item => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude!,
              longitude: item.longitude!,
            }}
          >
            <RNView style={styles.priceTag}>
              <Text style={styles.priceText}>${item.price}</Text>
            </RNView>
            <Callout 
              onPress={() => router.push(`/item/${item.id}`)}
              tooltip
            >
              <RNView style={styles.calloutContainer}>
                <RNView style={styles.calloutContent}>
                  {item.image_url && (
                    <Image source={{ uri: item.image_url }} style={styles.calloutImage} />
                  )}
                  <RNView style={styles.calloutTextContainer}>
                    <Text style={styles.calloutTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.calloutPrice}>${item.price}/day</Text>
                  </RNView>
                </RNView>
                <RNView style={styles.calloutArrow} />
              </RNView>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  calloutContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  calloutImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 8,
  },
  calloutTextContainer: {
    flex: 1,
  },
  calloutTitle: {
    ...typography.caption1Emphasized,
    color: Colors.text.primary,
  },
  calloutPrice: {
    ...typography.caption2Medium,
    color: Colors.brand.primary,
    marginTop: 2,
  },
  calloutArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
});
