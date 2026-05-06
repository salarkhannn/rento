process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

const rtl = require('@testing-library/react-native');
const { render, waitFor, fireEvent } = rtl;
const BrowseScreen = require('../app/(tabs)/index').default;
const { getRentalItems, getCategories } = require('../lib/queries');
const { useAuth } = require('../lib/AuthContext');

jest.mock('../lib/AuthContext');
jest.mock('../lib/queries');
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@/components/RentalItemCard', () => ({
  RentalItemCard: ({ item }: any) => require('react').createElement('Text', {}, item.title),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetRentalItems = getRentalItems as jest.MockedFunction<typeof getRentalItems>;
const mockGetCategories = getCategories as jest.MockedFunction<typeof getCategories>;

const items = [
  {
    id: 'item-1',
    title: 'Camera Lens',
    description: 'Great for portraits',
    location: 'Lahore',
    category: 'Electronics',
    price: 30,
    image_url: 'https://example.com/camera.jpg',
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

describe('BrowseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'other-user' } });
    mockGetRentalItems.mockResolvedValue(items as any);
    mockGetCategories.mockResolvedValue(categories as any);
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<BrowseScreen />);

    expect(getByText('Loading items...')).toBeTruthy();
  });

  it('loads and displays rental items with categories', async () => {
    const { getByText } = render(<BrowseScreen />);

    await waitFor(() => {
      expect(mockGetRentalItems).toHaveBeenCalled();
      expect(mockGetCategories).toHaveBeenCalled();
      expect(getByText('Camera Lens')).toBeTruthy();
    });

    expect(getByText('Camping Tent')).toBeTruthy();
    expect(getByText('Electronics')).toBeTruthy();
    expect(getByText('Outdoors')).toBeTruthy();
  });

  it('filters items by search query', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<BrowseScreen />);

    await waitFor(() => {
      expect(getByText('Camera Lens')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search items...');
    fireEvent.changeText(searchInput, 'tent');

    expect(getByText('Camping Tent')).toBeTruthy();
    expect(queryByText('Camera Lens')).toBeNull();
  });

  it('filters items by category chip', async () => {
    const { getByText, queryByText } = render(<BrowseScreen />);

    await waitFor(() => {
      expect(getByText('Camera Lens')).toBeTruthy();
    });

    fireEvent.press(getByText('Outdoors'));

    expect(getByText('Camping Tent')).toBeTruthy();
    expect(queryByText('Camera Lens')).toBeNull();
  });

  it('shows empty state when no items match filters', async () => {
    const { getByText, getByPlaceholderText } = render(<BrowseScreen />);

    await waitFor(() => {
      expect(getByText('Camera Lens')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search items...');
    fireEvent.changeText(searchInput, 'nonexistent');

    expect(getByText('No items available')).toBeTruthy();
    expect(getByText('Check back later for new rentals!')).toBeTruthy();
  });

  it('refreshes data when pulled', async () => {
    const { getByText, getByTestId } = render(<BrowseScreen />);

    await waitFor(() => {
      expect(getByText('Camera Lens')).toBeTruthy();
    });

    const flatList = getByTestId('browse-flatlist');
    const refreshControl = flatList.props.refreshControl.props;

    await refreshControl.onRefresh();

    expect(mockGetRentalItems).toHaveBeenCalledTimes(2);
    expect(mockGetCategories).toHaveBeenCalledTimes(2);
  });
});
