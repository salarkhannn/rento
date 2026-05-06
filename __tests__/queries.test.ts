import { getMessages, sendMessage, getConversations, markConversationAsRead, getUnreadMessageCount } from '../lib/queries';
import { supabase } from '../lib/supabase';

// Mock Supabase
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

describe('Message Queries', () => {
  const mockUser = { id: 'user-123' };
  const mockMessage = {
    id: 'msg-1',
    content: 'Hello!',
    sender_id: 'user-123',
    receiver_id: 'user-456',
    created_at: '2024-01-01T10:00:00Z',
    is_read: false,
    sender: { id: 'user-123', name: 'John' },
    receiver: { id: 'user-456', name: 'Jane' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
  });

  describe('getMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockData = [mockMessage];
      const mockSelect = jest.fn(() => ({
        or: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await getMessages('user-456');

      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(result).toEqual(mockData);
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      await expect(getMessages('user-456')).rejects.toThrow('User not authenticated');
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockMessage, error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await sendMessage('user-456', 'Hello!');

      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockInsert).toHaveBeenCalledWith({
        sender_id: 'user-123',
        receiver_id: 'user-456',
        content: 'Hello!',
      });
      expect(result).toEqual(mockMessage);
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      await expect(sendMessage('user-456', 'Hello!')).rejects.toThrow('User not authenticated');
    });
  });

  describe('getConversations', () => {
    it('should fetch conversations with latest messages', async () => {
      const mockMessages = [
        { ...mockMessage, sender_id: 'user-456', receiver_id: 'user-123' },
        { ...mockMessage, id: 'msg-2', sender_id: 'user-123', receiver_id: 'user-789' },
      ];

      const mockSelect = jest.fn(() => ({
        or: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockMessages, error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await getConversations();

      expect(result).toHaveLength(2);
      expect(supabase.from).toHaveBeenCalledWith('messages');
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      await expect(getConversations()).rejects.toThrow('User not authenticated');
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark messages as read', async () => {
      const mockUpdate = jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });

      await expect(markConversationAsRead('user-456')).resolves.toBeUndefined();

      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      await expect(markConversationAsRead('user-456')).rejects.toThrow('User not authenticated');
    });
  });

  describe('getUnreadMessageCount', () => {
    it('should return unread message count', async () => {
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ count: 5, error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await getUnreadMessageCount();

      expect(result).toBe(5);
      expect(supabase.from).toHaveBeenCalledWith('messages');
    });

    it('should return 0 when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      const result = await getUnreadMessageCount();

      expect(result).toBe(0);
    });
  });

  describe('createBooking', () => {
    it('should create a booking with authenticated user', async () => {
      const mockBooking = {
        id: 'booking-1',
        item_id: 'item-1',
        renter_id: 'user-123',
        start_date: '2025-05-01',
        end_date: '2025-05-03',
        total_price: 150,
        status: 'PENDING',
        item: { id: 'item-1', title: 'Test Item', price: 75 },
      };

      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockBooking, error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const { createBooking } = require('../lib/queries');
      const result = await createBooking({
        item_id: 'item-1',
        start_date: '2025-05-01',
        end_date: '2025-05-03',
        total_price: 150,
      });

      expect(supabase.from).toHaveBeenCalledWith('bookings');
      expect(mockInsert).toHaveBeenCalledWith({
        item_id: 'item-1',
        renter_id: 'user-123',
        start_date: '2025-05-01',
        end_date: '2025-05-03',
        total_price: 150,
      });
      expect(result).toEqual(mockBooking);
    });

    it('should fail when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      const { createBooking } = require('../lib/queries');
      await expect(createBooking({
        item_id: 'item-1',
        start_date: '2025-05-01',
        end_date: '2025-05-03',
        total_price: 150,
      })).rejects.toThrow('Not authenticated');
    });
  });
});