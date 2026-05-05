import React from 'react';
import { StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/ui/components/Button';

interface SearchFiltersProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    minPrice: string;
    maxPrice: string;
    distance: string;
  };
  onApply: (filters: { minPrice: string; maxPrice: string; distance: string }) => void;
}

export default function SearchFilters({ visible, onClose, filters, onApply }: SearchFiltersProps) {
  const [minPrice, setMinPrice] = React.useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = React.useState(filters.maxPrice);
  const [distance, setDistance] = React.useState(filters.distance);

  const handleApply = () => {
    onApply({ minPrice, maxPrice, distance });
    onClose();
  };

  const distances = ['5', '10', '20', '50', '100', 'Any'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range (per day)</Text>
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Min ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Max ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Any"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distance (km)</Text>
              <View style={styles.distanceContainer}>
                {distances.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.distanceChip,
                      distance === d && styles.activeChip
                    ]}
                    onPress={() => setDistance(d)}
                  >
                    <Text style={[
                      styles.distanceText,
                      distance === d && styles.activeDistanceText
                    ]}>
                      {d === 'Any' ? d : `${d} km`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setMinPrice('');
                setMaxPrice('');
                setDistance('Any');
              }}
            >
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
            <Button
              title="Apply Filters"
              onPress={handleApply}
              variant="filled"
              color="colored"
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...typography.title2Emphasized,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.headlineMedium,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    ...typography.caption1Medium,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  distanceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  distanceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  activeChip: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  distanceText: {
    ...typography.calloutMedium,
    color: Colors.text.primary,
  },
  activeDistanceText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 16,
  },
  clearButton: {
    padding: 12,
  },
  clearText: {
    ...typography.bodyEmphasized,
    color: Colors.text.secondary,
    textDecorationLine: 'underline',
  },
  applyButton: {
    flex: 1,
  },
});
