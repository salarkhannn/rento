import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
 * Navigation mode type - either 'renter' or 'lender'
 */
type NavMode = 'renter' | 'lender';

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
  // Configuration for both modes
  const navConfig: Record<NavMode, TabItem[]> = {
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

  const currentConfig = navConfig[mode];

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
    <View style={styles.container} accessible={true} accessibilityRole="tablist">
      {currentConfig.map((item: TabItem, index: number) => renderTabItem(item, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 92,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 15,
    paddingHorizontal: 11,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.background.tertiary,
    paddingBottom: 50,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export type { NavigationBarProps, TabItem, NavMode };
export default NavigationBar;