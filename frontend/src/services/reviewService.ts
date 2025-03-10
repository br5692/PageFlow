import api from './api';
import { ReviewDto, ReviewCreateDto } from '../types/review.types';
import { bookCache } from '../utils/bookCache';

export const reviewService = {
  getReviewsByBookId: async (bookId: number): Promise<ReviewDto[]> => {
    try {
      const response = await api.get<ReviewDto[]>(`/Reviews/book/${bookId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to fetch reviews for book ID ${bookId}`;
      console.error(`[ReviewService] getReviewsByBookId failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  createReview: async (review: ReviewCreateDto): Promise<ReviewDto> => {
    try {
      const response = await api.post<ReviewDto>('/Reviews', review);
      
      // After creating a review, get the updated book to get the new average rating
      const bookResponse = await api.get(`/Books/${review.bookId}`);
      const updatedBook = bookResponse.data;
      
      // Update only the average rating in cached books
      bookCache.updateBookInCaches(review.bookId, { 
        averageRating: updatedBook.averageRating 
      });
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create review';
      console.error(`[ReviewService] createReview failed: ${errorMessage}`, error);
      throw error;
    }
  }
};