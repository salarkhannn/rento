process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

import React from 'react';
import { act, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { renderWithProviders } from './test-utils';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/lib/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/queries', () => ({
  getRentalItems: jest.fn(),
  getCategories: jest.fn(),
}));

const { useAuth } = require('@/lib/AuthContext');
const { getRentalItems, getCategories } = require('@/lib/queries');
const BrowseScreen = require('../../app/(tabs)/index').default;


jest.mock('@/components/RentalItemCard', () => ({
  RentalItemCard: ({ item }: any) => require('react').createElement('Text', { testID: `item-${item.id}` }, item.title),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => require('react').createElement('Text', props, 'icon'),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockGetRentalItems = getRentalItems as jest.Mock;
const mockGetCategories = getCategories as jest.Mock;

const items = [
  {
    id: 'item-1',
    title: 'Camera Lens',
    description: 'Great for portraits',
    location: 'Lahore',
    category: 'Electronics',
    price: 30,
    image_url: 'https://example.com/lens.jpg',
    owner_id: 'owner-1',
    is_available: true,
  },
  {
    id: 'item-2',
    title: 'Camping Tent',
    description: 'Waterproof and spacious',
    location: 'Murree',
    category: 'Outdoors',
    price: 25,
    image_url: 'https://example.com/tent.jpg',
    owner_id: 'owner-2',
    is_available: true,
  },
];

const categories = [
  { id: 'cat-1', name: 'Electronics' },
  { id: 'cat-2', name: 'Outdoors' },
];

describe('Browse integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-123' } });
    mockGetRentalItems.mockResolvedValue(items);
    mockGetCategories.mockResolvedValue(categories);
  });

  it('renders the browse list and category chips', async () => {
    renderWithProviders(<BrowseScreen />);

    await waitFor(() => {
      expect(mockGetRentalItems).toHaveBeenCalled();
      expect(mockGetCategories).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Camera Lens')).toBeTruthy();
    });

    expect(screen.getByText('Camping Tent')).toBeTruthy();
    expect(screen.getByText('Electronics')).toBeTruthy();
    expect(screen.getByText('Outdoors')).toBeTruthy();
  });

  it('filters the item list by search input', async () => {
    renderWithProviders(<BrowseScreen />);

    await waitFor(() => {
      expect(mockGetRentalItems).toHaveBeenCalled();
      expect(mockGetCategories).toHaveBeenCalled();
    });

    fireEvent.changeText(screen.getByTestId('browse-search-input'), 'tent');

    expect(screen.getByText('Camping Tent')).toBeTruthy();
    expect(screen.queryByText('Camera Lens')).toBeNull();
  });

  it('filters the item list by category selection', async () => {
    renderWithProviders(<BrowseScreen />);

    await waitFor(() => {
      expect(screen.getByText('Camera Lens')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Outdoors'));

    expect(screen.getByText('Camping Tent')).toBeTruthy();
    expect(screen.queryByText('Camera Lens')).toBeNull();
  });

  it('refreshes the browse list', async () => {
    renderWithProviders(<BrowseScreen />);

    await waitFor(() => {
      expect(screen.getByText('Camera Lens')).toBeTruthy();
    });

    const flatList = screen.getByTestId('browse-flatlist');
    await act(async () => {
      await flatList.props.refreshControl.props.onRefresh();
    });

    expect(mockGetRentalItems).toHaveBeenCalledTimes(2);
    expect(mockGetCategories).toHaveBeenCalledTimes(2);
  });
});
