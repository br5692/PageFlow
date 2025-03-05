import api from './api';
import { BookDto, BookCreateDto, BookUpdateDto, BookFilterParams, PaginatedResponse } from '../types/book.types';
import { ReviewDto } from '../types/review.types';

export const bookService = {
  getAllBooks: async (sortBy?: string, ascending: boolean = true, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<BookDto>> => {
    const params = { sortBy, ascending, page, pageSize };
    const response = await api.get<PaginatedResponse<BookDto>>('/Books', { params });
    return response.data;
  },
  
  getFeaturedBooks: async (count: number = 4): Promise<PaginatedResponse<BookDto>> => {
    const response = await api.get<PaginatedResponse<BookDto>>('/Books/featured', { 
      params: { 
        count,
        availableOnly: true 
      } 
    });
    return response.data;
  },
  
  searchBooks: async (params: BookFilterParams): Promise<PaginatedResponse<BookDto>> => {
    const response = await api.get<PaginatedResponse<BookDto>>('/Books/search', { params });
    return response.data;
  },
  
  // Keep other methods unchanged
  getBookById: async (id: number): Promise<BookDto> => {
    const response = await api.get<BookDto>(`/Books/${id}`);
    return response.data;
  },
  
  createBook: async (book: BookCreateDto): Promise<BookDto> => {
    const response = await api.post<BookDto>('/Books', book);
    return response.data;
  },
  
  updateBook: async (book: BookUpdateDto): Promise<BookDto> => {
    const response = await api.put<BookDto>('/Books', book);
    return response.data;
  },
  
  deleteBook: async (id: number): Promise<void> => {
    await api.delete(`/Books/${id}`);
  },
  
  getBookReviews: async (bookId: number): Promise<ReviewDto[]> => {
    const response = await api.get<ReviewDto[]>(`/Books/${bookId}/reviews`);
    return response.data;
  }
};