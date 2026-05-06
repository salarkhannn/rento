import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { typography } from '@/ui/typography';
import Button from '@/ui/components/Button';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  
  const [ownerRating, setOwnerRating] = useState(0);
  const [ownerComment, setOwnerComment] = useState('');
  
  const [checklist, setChecklist] = useState({
    working: false,
    noScratches: false,
    allParts: false,
    clean: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    if (ownerRating === 0) {
      Alert.alert('Selection Required', 'Please rate the owner before submitting.');
      return;
    }
    Alert.alert('Thank You!', 'Your review has been submitted.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => setOwnerRating(star)}
            style={styles.starTouch}
          >
            <Ionicons 
              name={star <= ownerRating ? "star" : "star-outline"} 
              size={40} 
              color={star <= ownerRating ? "#FFD700" : "#E0E0E0"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 40 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Post-Rental Review</Text>
        </View>

        {/* SECTION 1: OWNER RATING */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Rate the Owner</Text>
          <Text style={styles.sectionSubtitle}>How was your experience with the owner?</Text>
          {renderStars()}
          <TextInput
            style={styles.textInput}
            placeholder="Share your experience with the owner..."
            multiline
            numberOfLines={4}
            value={ownerComment}
            onChangeText={setOwnerComment}
          />
        </View>

        {/* SECTION 2: EQUIPMENT CHECKLIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Equipment Condition</Text>
          <Text style={styles.sectionSubtitle}>Verify the items condition upon return:</Text>
          
          <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck('working')}>
            <Ionicons 
              name={checklist.working ? "checkbox" : "square-outline"} 
              size={24} 
              color={checklist.working ? Colors.brand.primary : Colors.text.tertiary} 
            />
            <Text style={styles.checkLabel}>Equipment is working perfectly</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck('noScratches')}>
            <Ionicons 
              name={checklist.noScratches ? "checkbox" : "square-outline"} 
              size={24} 
              color={checklist.noScratches ? Colors.brand.primary : Colors.text.tertiary} 
            />
            <Text style={styles.checkLabel}>No new scratches or physical damage</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck('allParts')}>
            <Ionicons 
              name={checklist.allParts ? "checkbox" : "square-outline"} 
              size={24} 
              color={checklist.allParts ? Colors.brand.primary : Colors.text.tertiary} 
            />
            <Text style={styles.checkLabel}>All parts and accessories returned</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck('clean')}>
            <Ionicons 
              name={checklist.clean ? "checkbox" : "square-outline"} 
              size={24} 
              color={checklist.clean ? Colors.brand.primary : Colors.text.tertiary} 
            />
            <Text style={styles.checkLabel}>Item was clean and well-maintained</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button 
            title="Submit Dual Review" 
            onPress={handleSubmit} 
            variant="filled" 
            color="colored"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    ...typography.title2Emphasized,
    color: Colors.text.primary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.headlineSemibold,
    color: Colors.brand.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...typography.subheadlineRegular,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starTouch: {
    padding: 6,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    height: 100,
    ...typography.bodyRegular,
    textAlignVertical: 'top',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkLabel: {
    marginLeft: 12,
    ...typography.bodyRegular,
    color: Colors.text.primary,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 10,
  }
});
