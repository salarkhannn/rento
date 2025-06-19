import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';

type PickupMethod = 'owner_delivery' | 'renter_pickup' | 'courier_supported';

interface PickupMethodSelectorProps {
  onMethodChange: (method: PickupMethod) => void;
  initialMethod?: PickupMethod;
}

const PICKUP_METHODS = [
  {
    value: 'renter_pickup' as PickupMethod,
    label: 'Renter Pickup',
    icon: '🚗',
    description: 'Renter comes to pickup location',
  },
  {
    value: 'owner_delivery' as PickupMethod,
    label: 'Owner Delivery',
    icon: '🚚',
    description: 'Owner delivers to renter',
  },
  {
    value: 'courier_supported' as PickupMethod,
    label: 'Courier Service',
    icon: '📦',
    description: 'Third-party courier delivery',
  },
];

export function PickupMethodSelector({ onMethodChange, initialMethod }: PickupMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PickupMethod>(
    initialMethod || 'renter_pickup'
  );

  const handleMethodSelect = (method: PickupMethod) => {
    setSelectedMethod(method);
    onMethodChange(method);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pickup Method</Text>
      
      <View style={styles.methodsContainer}>
        {PICKUP_METHODS.map((method) => (
          <TouchableOpacity
            key={method.value}
            style={[
              styles.methodButton,
              selectedMethod === method.value && styles.methodButtonSelected
            ]}
            onPress={() => handleMethodSelect(method.value)}
          >
            <Text style={styles.methodIcon}>{method.icon}</Text>
            <Text style={[
              styles.methodLabel,
              selectedMethod === method.value && styles.methodLabelSelected
            ]}>
              {method.label}
            </Text>
            <Text style={[
              styles.methodDescription,
              selectedMethod === method.value && styles.methodDescriptionSelected
            ]}>
              {method.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.helpText}>
        Choose how renters can receive this item
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  methodsContainer: {
    gap: 8,
    marginBottom: 8,
  },
  methodButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  methodButtonSelected: {
    borderColor: '#2f95dc',
    backgroundColor: '#f0f8ff',
  },
  methodIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  methodLabelSelected: {
    color: '#2f95dc',
  },
  methodDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  methodDescriptionSelected: {
    color: '#1976d2',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});