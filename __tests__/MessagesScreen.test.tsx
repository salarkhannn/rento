import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import MessagesScreen from '../app/(tabs)/messages';
import { useAuth } from '../lib/AuthContext';
import { getConversations, getUnreadMessageCount } from '../lib/queries';

// Mock dependencies
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            single: jest.fn(),
          })),
          single: jest.fn(),
        })),
        or: jest.fn(() => ({
          order: jest.fn(),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
    })),
  },
}));
jest.mock('../lib/AuthContext');
jest.mock('../lib/queries');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));
jest.mock('../components/ConditionalAuthGuard', () => ({
  ConditionalAuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetConversations = getConversations as jest.MockedFunction<typeof getConversations>;
const mockGetUnreadMessageCount = getUnreadMessageCount as jest.MockedFunction<typeof getUnreadMessageCount>;
const mockRouter = require('expo-router').router;

describe('MessagesScreen', () => {
  const mockUser = { id: 'user-123', name: 'John' };
  const mockConversations = [
    {
      id: 'msg-1',
      content: 'Hello!',
      sender_id: 'user-456',
      receiver_id: 'user-123',
      created_at: '2024-01-01T10:00:00Z',
      is_read: false,
      sender: { id: 'user-456', name: 'Jane' },
      receiver: mockUser,
    },
    {
      id: 'msg-2',
      content: 'How are you?',
      sender_id: 'user-789',
      receiver_id: 'user-123',
      created_at: '2024-01-01T09:00:00Z',
      is_read: true,
      sender: { id: 'user-789', name: 'Bob' },
      receiver: mockUser,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockGetConversations.mockResolvedValue(mockConversations);
    mockGetUnreadMessageCount.mockResolvedValue(1);
  });

  it('renders loading state initially', () => {
    render(<MessagesScreen />);

    expect(screen.getByText('Loading messages...')).toBeTruthy();
  });

  it('loads and displays conversations', async () => {
    render(<MessagesScreen />);

    await waitFor(() => {
      expect(mockGetConversations).toHaveBeenCalled();
      expect(mockGetUnreadMessageCount).toHaveBeenCalled();
    });

    // Check if conversations are displayed
    expect(screen.getByText('Jane')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('Hello!')).toBeTruthy();
    expect(screen.getByText('How are you?')).toBeTruthy();
  });

  it('displays unread indicator for unread messages', async () => {
    render(<MessagesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeTruthy();
    });

    // Should show unread dot for Jane's conversation
    const unreadDots = screen.getAllByTestId('unread-dot');
    expect(unreadDots.length).toBeGreaterThan(0);
  });

  it('filters conversations by All/Unread', async () => {
    render(<MessagesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeTruthy();
    });

    // Initially shows all conversations
    expect(screen.getByText('Jane')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();

    // Switch to Unread filter
    const unreadButton = screen.getByText('Unread');
    fireEvent.press(unreadButton);

    // Should only show Jane's conversation (unread)
    expect(screen.getByText('Jane')).toBeTruthy();
    expect(screen.queryByText('Bob')).toBeNull();
  });

  it('opens conversation when item is pressed', async () => {
    render(<MessagesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeTruthy();
    });

    const conversationItem = screen.getByText('Jane').parent?.parent;
    fireEvent.press(conversationItem);

    expect(mockRouter.push).toHaveBeenCalledWith('/conversation/user-456?name=Jane');
  });

  it('displays empty state when no conversations', async () => {
    mockGetConversations.mockResolvedValueOnce([]);

    render(<MessagesScreen />);

    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeTruthy();
    });

    expect(screen.getByText('Start a conversation by contacting item owners')).toBeTruthy();
  });

  it('handles refresh', async () => {
    render(<MessagesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeTruthy();
    });

    // Trigger refresh (this would be called by the RefreshControl)
    const { onRefresh } = screen.getByTestId('flat-list').props.refreshControl.props;
    await onRefresh();

    expect(mockGetConversations).toHaveBeenCalledTimes(2);
    expect(mockGetUnreadMessageCount).toHaveBeenCalledTimes(2);
  });

  it('handles error loading conversations', async () => {
    mockGetConversations.mockRejectedValueOnce(new Error('Load failed'));

    render(<MessagesScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load conversations');
    });
  });

  it('clears data when user signs out', async () => {
    const { rerender } = render(<MessagesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeTruthy();
    });

    // Simulate user signing out
    mockUseAuth.mockReturnValue({ user: null });
    rerender(<MessagesScreen />);

    // Data should be cleared
    expect(mockGetConversations).toHaveBeenCalledTimes(1); // Only initial call
  });

  it('formats timestamps correctly', async () => {
    // Mock current date to be 2024-01-01
    const mockDate = new Date('2024-01-01T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    render(<MessagesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeTruthy();
    });

    // Messages from today should show time
    expect(screen.getByText('10:00 AM')).toBeTruthy();

    jest.restoreAllMocks();
  });
});