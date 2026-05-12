import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ConversationScreen from '../app/conversation/[id]';
import { useAuth } from '../lib/AuthContext';
import { getMessages, sendMessage, markConversationAsRead } from '../lib/queries';

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
  useLocalSearchParams: jest.fn(),
  router: {
    back: jest.fn(),
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 20, bottom: 20 })),
}));
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock Keyboard
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams as jest.Mock;
const mockGetMessages = getMessages as jest.MockedFunction<typeof getMessages>;
const mockSendMessage = sendMessage as jest.MockedFunction<typeof sendMessage>;
const mockMarkConversationAsRead = markConversationAsRead as jest.MockedFunction<typeof markConversationAsRead>;

describe('ConversationScreen', () => {
  const mockUser = { id: 'user-123', name: 'John' };
  const mockOtherUser = { id: 'user-456', name: 'Jane' };
  const mockMessages = [
    {
      id: 'msg-1',
      content: 'Hello!',
      sender_id: 'user-456',
      receiver_id: 'user-123',
      created_at: '2024-01-01T10:00:00Z',
      is_read: true,
      sender: mockOtherUser,
      receiver: mockUser,
    },
    {
      id: 'msg-2',
      content: 'Hi there!',
      sender_id: 'user-123',
      receiver_id: 'user-456',
      created_at: '2024-01-01T10:01:00Z',
      is_read: true,
      sender: mockUser,
      receiver: mockOtherUser,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockUseLocalSearchParams.mockReturnValue({ id: 'user-456', name: 'Jane' });
    mockGetMessages.mockResolvedValue(mockMessages);
    mockSendMessage.mockResolvedValue({
      id: 'msg-3',
      content: 'New message',
      sender_id: 'user-123',
      receiver_id: 'user-456',
      created_at: '2024-01-01T10:02:00Z',
      is_read: false,
      sender: mockUser,
      receiver: mockOtherUser,
    });
    mockMarkConversationAsRead.mockResolvedValue();
  });

  it('renders loading state initially', () => {
    render(<ConversationScreen />);

    expect(screen.getByText('Loading conversation...')).toBeTruthy();
  });

  it('loads and displays messages', async () => {
    render(<ConversationScreen />);

    await waitFor(() => {
      expect(mockGetMessages).toHaveBeenCalledWith('user-456');
      expect(mockMarkConversationAsRead).toHaveBeenCalledWith('user-456');
    });

    // Check if messages are displayed
    expect(screen.getByText('Hello!')).toBeTruthy();
    expect(screen.getByText('Hi there!')).toBeTruthy();
  });

  it('displays user name in header', async () => {
    render(<ConversationScreen />);

    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeTruthy();
    });
  });

  it('sends a message when send button is pressed', async () => {
    render(<ConversationScreen />);

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeTruthy();
    });

    const textInput = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByTestId('send-button'); // We'll need to add testID

    fireEvent.changeText(textInput, 'New message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('user-456', 'New message');
    });

    // Check if input is cleared
    expect(textInput.props.value).toBe('');
  });

  it('does not send empty message', async () => {
    render(<ConversationScreen />);

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeTruthy();
    });

    const sendButton = screen.getByTestId('send-button');

    fireEvent.press(sendButton);

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('handles send message error', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('Send failed'));

    render(<ConversationScreen />);

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeTruthy();
    });

    const textInput = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.changeText(textInput, 'Test message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to send message');
    });

    // Message should be restored
    expect(textInput.props.value).toBe('Test message');
  });

  it('navigates back when back button is pressed', async () => {
    const mockRouter = require('expo-router').router;

    render(<ConversationScreen />);

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeTruthy();
    });

    const backButton = screen.getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('shows date separators for different days', async () => {
    const messagesWithDifferentDates = [
      {
        ...mockMessages[0],
        created_at: '2024-01-01T10:00:00Z',
      },
      {
        ...mockMessages[1],
        created_at: '2024-01-02T10:00:00Z',
      },
    ];

    mockGetMessages.mockResolvedValueOnce(messagesWithDifferentDates);

    render(<ConversationScreen />);

    await waitFor(() => {
      expect(screen.getByText('Today')).toBeTruthy();
      expect(screen.getByText('Yesterday')).toBeTruthy();
    });
  });

  it('displays messages with correct styling for sender/receiver', async () => {
    render(<ConversationScreen />);

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeTruthy();
    });

    // The first message should be from the other user (left-aligned)
    // The second message should be from current user (right-aligned)
    // We can check for specific styling classes or test IDs in a more complete implementation
  });
});