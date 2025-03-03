import api from './api';
import { ReviewDto, ReviewCreateDto } from '../types/review.types';

export const reviewService = {
  getReviewsByBookId: async (bookId: number): Promise<ReviewDto[]> => {
    const response = await api.get<ReviewDto[]>(`/Reviews/book/${bookId}`);
    return response.data;
  },
  
  createReview: async (review: ReviewCreateDto): Promise<ReviewDto> => {
    const response = await api.post<ReviewDto>('/Reviews', review);
    return response.data;
  }
};