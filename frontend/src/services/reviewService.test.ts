import { reviewService } from './reviewService';
import api from './api';
import { ReviewDto, ReviewCreateDto } from '../types/review.types';

// Mock the API module
jest.mock('./api');

describe('Review Service', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockReview: ReviewDto = {
    id: 1,
    bookId: 1,
    userId: 'user1',
    userName: 'Test User',
    rating: 4,
    comment: 'Great book!',
    createdAt: '2023-01-01T00:00:00'
  };

  const mockReviews = [mockReview];

  describe('getReviewsByBookId', () => {
    test('should call api.get with correct URL', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockReviews });

      // Act
      await reviewService.getReviewsByBookId(1);

      // Assert
      expect(api.get).toHaveBeenCalledWith('/Reviews/book/1');
    });

    test('should return array of reviews', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockReviews });

      // Act
      const result = await reviewService.getReviewsByBookId(1);

      // Assert
      expect(result).toEqual(mockReviews);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should throw error if API call fails', async () => {
      // Arrange
      const mockError = new Error('Failed to fetch reviews');
      (api.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(reviewService.getReviewsByBookId(1)).rejects.toThrow(mockError);
    });

    test('should return empty array if no reviews found', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      // Act
      const result = await reviewService.getReviewsByBookId(1);

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('createReview', () => {
    const mockReviewCreate: ReviewCreateDto = {
      bookId: 1,
      rating: 4,
      comment: 'Great book!'
    };

    test('should call api.post with review data', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockReview });

      // Act
      await reviewService.createReview(mockReviewCreate);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/Reviews', mockReviewCreate);
    });

    test('should return created review data', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockReview });

      // Act
      const result = await reviewService.createReview(mockReviewCreate);

      // Assert
      expect(result).toEqual(mockReview);
      expect(result.id).toBe(1);
      expect(result.bookId).toBe(mockReviewCreate.bookId);
      expect(result.rating).toBe(mockReviewCreate.rating);
      expect(result.comment).toBe(mockReviewCreate.comment);
    });

    test('should throw error if API call fails', async () => {
      // Arrange
      const mockError = new Error('Failed to create review');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(reviewService.createReview(mockReviewCreate)).rejects.toThrow(mockError);
    });

    test('should handle review with no comment', async () => {
      // Arrange
      const reviewWithoutComment: ReviewCreateDto = {
        bookId: 1,
        rating: 5,
        comment: null
      };
      
      const responseReview = {
        ...mockReview,
        rating: 5,
        comment: null
      };
      
      (api.post as jest.Mock).mockResolvedValue({ data: responseReview });

      // Act
      const result = await reviewService.createReview(reviewWithoutComment);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/Reviews', reviewWithoutComment);
      expect(result.comment).toBeNull();
    });
  });
});