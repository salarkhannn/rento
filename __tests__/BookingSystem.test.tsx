import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import BookingsScreen from '../app/(tabs)/bookings';

jest.mock('@/lib/queries', () => ({
  getMyBookings: jest.fn(),
  updateBookingStatus: jest.fn(),
}));

jest.mock('@/lib/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/ConditionalAuthGuard', () => ({
  ConditionalAuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/lib/notificationQueries', () => ({
  handleBookingStatusChange: jest.fn(),
}));

jest.mock('@/lib/notifications', () => ({
  scheduleLocalNotification: jest.fn(),
}));

const { getMyBookings, updateBookingStatus } = require('@/lib/queries');
const { handleBookingStatusChange } = require('@/lib/notificationQueries');
const { scheduleLocalNotification } = require('@/lib/notifications');
const { useAuth } = require('@/lib/AuthContext');

describe('Booking System UI', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue({
      user: mockUser,
    });

    Alert.alert = jest.fn((title, message, buttons) => {
      if (Array.isArray(buttons)) {
        const confirmButton = buttons.find((button) => button?.text === 'Yes');
        if (confirmButton && typeof confirmButton.onPress === 'function') {
          confirmButton.onPress();
        }
      }
    });
  });

  it('should show pending booking and cancel it successfully', async () => {
    const booking = {
      id: 'booking-1',
      status: 'PENDING',
      item: { title: 'Test Kayak' },
      start_date: '2025-05-01',
      end_date: '2025-05-03',
      total_price: 120,
      renter_id: mockUser.id,
    };

    getMyBookings.mockResolvedValue([booking]);
    updateBookingStatus.mockResolvedValue({});
    handleBookingStatusChange.mockResolvedValue(undefined);
    scheduleLocalNotification.mockResolvedValue(undefined);

    render(<BookingsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Test Kayak')).toBeTruthy();
      expect(screen.getByText('PENDING')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(updateBookingStatus).toHaveBeenCalledWith('booking-1', 'CANCELLED');
      expect(handleBookingStatusChange).toHaveBeenCalledWith('booking-1', 'CANCELLED');
      expect(scheduleLocalNotification).toHaveBeenCalledWith(
        '🚫 Booking Cancelled',
        'Your booking has been successfully cancelled',
        1,
        expect.objectContaining({ booking_id: 'booking-1', action: 'booking_cancelled' })
      );
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Booking has been cancelled successfully.');
    });
  });
});
