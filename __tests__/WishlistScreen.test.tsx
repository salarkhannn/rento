process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

jest.mock('../lib/AuthContext');
jest.mock('../lib/queries');
jest.mock('../lib/notificationQueries');
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/components/ConditionalAuthGuard', () => ({
  ConditionalAuthGuard: ({ children }: any) => require('react').createElement(require('react').Fragment, null, children),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: 'FontAwesome',
  Ionicons: 'Ionicons',
}));

const React = require('react');
const rtl = require('@testing-library/react-native');
const { render, waitFor, fireEvent } = rtl;
const { useAuth } = require('../lib/AuthContext');
const { getWishlistItems } = require('../lib/queries');
const { getUnreadNotificationCount } = require('../lib/notificationQueries');
const WishlistScreen = require('../app/(tabs)/wishlist').default;

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetWishlistItems = getWishlistItems as jest.MockedFunction<typeof getWishlistItems>;
const mockGetUnreadNotificationCount = getUnreadNotificationCount as jest.MockedFunction<typeof getUnreadNotificationCount>;
const mockRouter = require('expo-router').router;

const mockWishlistItem = {
  id: 'item-1',
  title: 'Camera Lens',
  price: 30,
  image_url: 'https://example.com/image.jpg',
  description: 'Great for portraits',
  location: 'Lahore',
  category: 'Electronics',
  owner_id: 'owner-1',
  is_available: true,
};

describe('WishlistScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
    mockGetWishlistItems.mockResolvedValue([mockWishlistItem] as any);
    mockGetUnreadNotificationCount.mockResolvedValue(5);
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<WishlistScreen />);

    expect(getByText('Loading wishlist...')).toBeTruthy();
  });

  it('loads and displays wishlist items', async () => {
    const { getByText } = render(<WishlistScreen />);

    await waitFor(() => {
      expect(mockGetWishlistItems).toHaveBeenCalled();
      expect(mockGetUnreadNotificationCount).toHaveBeenCalled();
      expect(getByText('Camera Lens')).toBeTruthy();
    });

    expect(getByText('$30/day')).toBeTruthy();
    expect(getByText('Great for portraits')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('shows the empty state when wishlist is empty', async () => {
    mockGetWishlistItems.mockResolvedValueOnce([] as any);

    const { getByText } = render(<WishlistScreen />);

    await waitFor(() => {
      expect(getByText('Your wishlist is empty')).toBeTruthy();
    });

    expect(getByText("Save items you're interested in renting")).toBeTruthy();
  });

  it('refreshes the wishlist when pulled', async () => {
    const { getByText, getByTestId } = render(<WishlistScreen />);

    await waitFor(() => {
      expect(getByText('Camera Lens')).toBeTruthy();
    });

    const flatList = getByTestId('wishlist-flatlist');
    const refreshControl = flatList.props.refreshControl.props;

    await refreshControl.onRefresh();

    expect(mockGetWishlistItems).toHaveBeenCalledTimes(2);
  });

  it('navigates to notifications when the bell is pressed', async () => {
    const { getByText, getByTestId } = render(<WishlistScreen />);

    await waitFor(() => {
      expect(getByText('Camera Lens')).toBeTruthy();
    });

    fireEvent.press(getByTestId('notifications-button'));

    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/notifications');
  });
});
