import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

/**
 * Navigation mode type - either 'renter' or 'lender'
 */
type NavMode = 'renter' | 'lender';

/**
 * Individual tab item configuration
 */
interface TabItem {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
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
      { label: 'Explore', icon: 'search' },
      { label: 'Wishlist', icon: 'heart' },
      { label: 'Bookings', icon: 'calendar' },
      { label: 'Messages', icon: 'envelope' },
      { label: 'Profile', icon: 'user' }
    ],
    lender: [
      { label: 'Dashboard', icon: 'tachometer' },
      { label: 'Listings', icon: 'list' },
      { label: 'Bookings', icon: 'calendar' },
      { label: 'Messages', icon: 'envelope' },
      { label: 'Profile', icon: 'user' }
    ]
  };

  const currentConfig = navConfig[mode];

  const renderTabItem = (item: TabItem, index: number) => {
    const isActive = activeTab === index;
    
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
          <FontAwesome 
            name={item.icon}
            size={18}
            color={isActive ? '#000000' : '#8E8E93'}
            style={{ opacity: isActive ? 1 : 0.6 }}
          />
        </View>
        <Text style={[
          styles.tabLabel,
          { color: isActive ? '#000000' : '#8E8E93' }
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  iconContainer: {
    marginBottom: 4,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export type { NavigationBarProps, TabItem, NavMode };
export default NavigationBar;