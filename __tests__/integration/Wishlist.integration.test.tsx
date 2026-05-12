process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

import React from 'react';
import { act, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { View, Text, Pressable } from 'react-native';
import { renderWithProviders } from './test-utils';

jest.mock('@/lib/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/queries', () => ({
  getWishlistItems: jest.fn(),
}));

jest.mock('@/lib/notificationQueries', () => ({
  getUnreadNotificationCount: jest.fn(),
}));

const { useAuth } = require('@/lib/AuthContext');
const { getWishlistItems } = require('@/lib/queries');
const { getUnreadNotificationCount } = require('@/lib/notificationQueries');
const WishlistScreen = require('../../app/(tabs)/wishlist').default;


jest.mock('@expo/vector-icons', () => ({
  FontAwesome: (props: any) => require('react').createElement('Text', props, 'icon'),
}));

jest.mock('@/components/ConditionalAuthGuard', () => ({
  ConditionalAuthGuard: ({ children }: any) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/components/WishlistItemCard', () => {
  const { View, Text, Pressable } = require('react-native');

  return {
    WishlistItemCard: ({ item, onRemove }: any) => (
      <View>
        <Text>{item.title}</Text>
        <Pressable testID={`remove-${item.id}`} onPress={() => onRemove?.(item.id)}>
          <Text>Remove</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

const mockUseAuth = useAuth as jest.Mock;
const mockGetWishlistItems = getWishlistItems as jest.Mock;
const mockGetUnreadNotificationCount = getUnreadNotificationCount as jest.Mock;
const mockRouter = require('expo-router').router;

const wishlistItem = {
  id: 'item-1',
  title: 'Camera Lens',
  price: 30,
  image_url: 'https://example.com/camera.jpg',
  description: 'Great for portraits',
  location: 'Lahore',
  category: 'Electronics',
  owner_id: 'owner-1',
  is_available: true,
};

describe('Wishlist integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
    mockGetWishlistItems.mockResolvedValue([wishlistItem]);
    mockGetUnreadNotificationCount.mockResolvedValue(3);
  });

  it('loads the wishlist and shows unread notification count', async () => {
    renderWithProviders(<WishlistScreen />);

    await waitFor(() => {
      expect(screen.getByText('Camera Lens')).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByText('3')).toBeTruthy();
    });
  });

  it('removes an item from the wishlist list when remove is pressed', async () => {
    renderWithProviders(<WishlistScreen />);

    await waitFor(() => {
      expect(screen.getByText('Camera Lens')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('remove-item-1'));

    await waitFor(() => {
      expect(screen.queryByText('Camera Lens')).toBeNull();
    });
  });

  it('navigates to notifications when the bell is pressed', async () => {
    renderWithProviders(<WishlistScreen />);

    await waitFor(() => {
      expect(screen.getByText('Camera Lens')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('notifications-button'));

    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/notifications');
  });

  it('refreshes data when the list is pulled', async () => {
    renderWithProviders(<WishlistScreen />);

    await waitFor(() => {
      expect(screen.getByText('Camera Lens')).toBeTruthy();
    });

    const flatList = screen.getByTestId('wishlist-flatlist');
    await act(async () => {
      await flatList.props.refreshControl.props.onRefresh();
    });

    expect(mockGetWishlistItems).toHaveBeenCalledTimes(2);
  });
});
