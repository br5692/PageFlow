import api from './api';
import { ReviewDto, ReviewCreateDto } from '../types/review.types';

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
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create review';
      console.error(`[ReviewService] createReview failed: ${errorMessage}`, error);
      throw error;
    }
  }
};