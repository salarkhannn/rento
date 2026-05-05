import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { 
  Compass, 
  Heart, 
  Calendar, 
  MessageCircle, 
  User, 
  BarChart3, 
  List 
} from 'lucide-react-native';
import Colors from '@/constants/Colors';

/**
 * Navigation mode type - 'renter', 'lender', or 'guest'
 */
type NavMode = 'renter' | 'lender' | 'guest';

/**
 * Individual tab item configuration
 */
interface TabItem {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

/**
 * Props for the NavigationBar component
 */
interface NavigationBarProps {
  /** Navigation mode - determines which tabs are shown */
  mode?: NavMode;
  /** Index of the currently active tab (0-4) */
  activeTab?: number;
  /** Callback function called when a tab is pressed */
  onTabPress?: (index: number, label: string) => void;
}

/**
 * Bottom navigation bar component with support for renter and lender modes
 */
const NavigationBar: React.FC<NavigationBarProps> = ({ 
  mode = 'renter',
  activeTab = 0,
  onTabPress 
}) => {
  // Configuration for all modes
  const navConfig: Record<NavMode, TabItem[]> = {
    guest: [
      { label: 'Explore', icon: Compass },
      { label: 'Sign In', icon: User },
    ],
    renter: [
      { label: 'Explore', icon: Compass },
      { label: 'Wishlist', icon: Heart },
      { label: 'Bookings', icon: Calendar },
      { label: 'Messages', icon: MessageCircle },
      { label: 'Profile', icon: User }
    ],
    lender: [
      { label: 'Dashboard', icon: BarChart3 },
      { label: 'Listings', icon: List },
      { label: 'Bookings', icon: Calendar },
      { label: 'Messages', icon: MessageCircle },
      { label: 'Profile', icon: User }
    ]
  };

  const currentConfig = navConfig[mode || 'renter'];

  // Safety check to prevent map error
  const glassProps = Platform.OS === 'ios'
    ? { glassEffectStyle: 'regular' as const, tintColor: Colors.background.primary }
    : {};

  if (!currentConfig) {
    return (
      <GlassView style={styles.container} accessible={true} accessibilityRole="tablist" {...glassProps} />
    );
  }

  const renderTabItem = (item: TabItem, index: number) => {
    const isActive = activeTab === index;
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.tabItem}
        onPress={() => onTabPress?.(index, item.label)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={`${item.label} tab`}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
      >
        <View style={styles.iconContainer}>
          <IconComponent 
            size={24}
            color={isActive ? Colors.text.primary : Colors.text.disabled}
          />
        </View>
        <Text style={[
          styles.tabLabel,
          { color: isActive ? Colors.text.primary : Colors.text.disabled }
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.floatingContainer}>
      <GlassView style={styles.container} accessible={true} accessibilityRole="tablist" {...glassProps}>
        {currentConfig.map((item: TabItem, index: number) => renderTabItem(item, index))}
      </GlassView>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : Colors.background.primary,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export type { NavigationBarProps, TabItem, NavMode };
export default NavigationBar;