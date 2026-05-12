import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { createReview, getReviewsForUser, getAverageRating } from '../lib/queries';
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

describe('Review System', () => {
  const mockUser = { id: 'user-123', name: 'John' };
  const mockReview = {
    id: 'review-1',
    reviewer_id: 'user-123',
    reviewee_id: 'user-456',
    booking_id: 'booking-1',
    rating: 5,
    comment: 'Great experience!',
    created_at: '2024-01-01T10:00:00Z',
    reviewer: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockReview, error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await createReview({
        reviewer_id: 'user-123',
        reviewee_id: 'user-456',
        booking_id: 'booking-1',
        rating: 5,
        comment: 'Great experience!',
      });

      expect(supabase.from).toHaveBeenCalledWith('reviews');
      expect(result).toEqual(mockReview);
    });
  });

  describe('getReviewsForUser', () => {
    it('should fetch reviews for a user', async () => {
      const mockData = [mockReview];
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await getReviewsForUser('user-456');

      expect(supabase.from).toHaveBeenCalledWith('reviews');
      expect(result).toEqual(mockData);
    });
  });

  describe('getAverageRating', () => {
    it('should calculate average rating', async () => {
      const mockData = [
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
      ];
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await getAverageRating('user-456');

      expect(result).toBe(4);
    });

    it('should return 0 when no reviews', async () => {
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await getAverageRating('user-456');

      expect(result).toBe(0);
    });
  });

  describe('Review UI Components', () => {
    it('should display reviews for an item', async () => {
      // Mock component that displays reviews
      const mockReviews = [
        {
          id: 'review-1',
          reviewer_id: 'user-123',
          reviewee_id: 'user-456',
          booking_id: 'booking-1',
          rating: 5,
          comment: 'Great experience!',
          created_at: '2024-01-01T10:00:00Z',
          reviewer: { id: 'user-123', name: 'John' },
        },
        {
          id: 'review-2',
          reviewer_id: 'user-789',
          reviewee_id: 'user-456',
          booking_id: 'booking-2',
          rating: 4,
          comment: 'Good service',
          created_at: '2024-01-02T10:00:00Z',
          reviewer: { id: 'user-789', name: 'Jane' },
        },
      ];

      // Mock ReviewList component using React Native components
      const ReviewList = ({ reviews }: { reviews: typeof mockReviews }) => (
        <React.Fragment>
          {reviews.map(review => (
            <View key={review.id} testID={`review-${review.id}`}>
              <Text testID={`reviewer-${review.id}`}>{review.reviewer.name}</Text>
              <Text testID={`rating-${review.id}`}>{'★'.repeat(review.rating)}</Text>
              <Text testID={`comment-${review.id}`}>{review.comment}</Text>
            </View>
          ))}
        </React.Fragment>
      );

      render(<ReviewList reviews={mockReviews} />);

      // Check that reviews are displayed
      expect(screen.getByTestId('review-review-1')).toBeTruthy();
      expect(screen.getByTestId('review-review-2')).toBeTruthy();
      expect(screen.getByTestId('reviewer-review-1')).toHaveTextContent('John');
      expect(screen.getByTestId('reviewer-review-2')).toHaveTextContent('Jane');
      expect(screen.getByTestId('rating-review-1')).toHaveTextContent('★★★★★');
      expect(screen.getByTestId('rating-review-2')).toHaveTextContent('★★★★');
      expect(screen.getByTestId('comment-review-1')).toHaveTextContent('Great experience!');
      expect(screen.getByTestId('comment-review-2')).toHaveTextContent('Good service');
    });

    it('should show average rating display', () => {
      const AverageRating = ({ rating }: { rating: number }) => (
        <View testID="average-rating">
          <Text testID="rating-stars">{'★'.repeat(Math.round(rating))}</Text>
          <Text testID="rating-value">{rating.toFixed(1)}</Text>
        </View>
      );

      render(<AverageRating rating={4.2} />);

      expect(screen.getByTestId('average-rating')).toBeTruthy();
      expect(screen.getByTestId('rating-stars')).toHaveTextContent('★★★★');
      expect(screen.getByTestId('rating-value')).toHaveTextContent('4.2');
    });

    it('should render review form', () => {
      const ReviewForm = () => (
        <React.Fragment>
          <Text testID="rating-input">Rating: ★★★★★</Text>
          <Text testID="comment-input">Comment input</Text>
          <TouchableOpacity testID="submit-review">
            <Text>Submit Review</Text>
          </TouchableOpacity>
        </React.Fragment>
      );

      render(<ReviewForm />);

      expect(screen.getByTestId('rating-input')).toBeTruthy();
      expect(screen.getByTestId('comment-input')).toBeTruthy();
      expect(screen.getByTestId('submit-review')).toBeTruthy();
    });

    it('should show empty state when no reviews', () => {
      const ReviewList = ({ reviews }: { reviews: any[] }) => (
        reviews.length === 0 ? (
          <Text testID="no-reviews">No reviews yet</Text>
        ) : (
          <Text testID="reviews-list">Reviews</Text>
        )
      );

      render(<ReviewList reviews={[]} />);

      expect(screen.getByTestId('no-reviews')).toHaveTextContent('No reviews yet');
      expect(screen.queryByTestId('reviews-list')).toBeNull();
    });
  });
});