import api from './api';
import { BookDto, BookCreateDto, BookUpdateDto, BookFilterParams, PaginatedResponse } from '../types/book.types';
import { ReviewDto } from '../types/review.types';
import { bookCache } from '../utils/bookCache';

export const bookService = {
  getAllBooks: async (sortBy?: string, ascending: boolean = true, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<BookDto>> => {
    try {
      const params = { sortBy, ascending, page, pageSize };
      const response = await api.get<PaginatedResponse<BookDto>>('/Books', { params });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch books';
      console.error(`[BookService] getAllBooks failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  getFeaturedBooks: async (count: number = 4): Promise<PaginatedResponse<BookDto>> => {
    try {
      const response = await api.get<PaginatedResponse<BookDto>>('/Books/featured', { 
        params: { 
          count,
          availableOnly: true 
        } 
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch featured books';
      console.error(`[BookService] getFeaturedBooks failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  searchBooks: async (params: BookFilterParams): Promise<PaginatedResponse<BookDto>> => {
    try {
      const response = await api.get<PaginatedResponse<BookDto>>('/Books/search', { params });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to search books';
      console.error(`[BookService] searchBooks failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  getBookById: async (id: number): Promise<BookDto> => {
    try {
      const response = await api.get<BookDto>(`/Books/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to fetch book with ID ${id}`;
      console.error(`[BookService] getBookById failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  createBook: async (book: BookCreateDto): Promise<BookDto> => {
    try {
      const response = await api.post<BookDto>('/Books', book);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create book';
      console.error(`[BookService] createBook failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  updateBook: async (book: BookUpdateDto): Promise<BookDto> => {
    try {
      const response = await api.put<BookDto>('/Books', book);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to update book with ID ${book.id}`;
      console.error(`[BookService] updateBook failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  deleteBook: async (id: number): Promise<void> => {
    try {
      await api.delete(`/Books/${id}`);
      bookCache.clearCache();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to delete book with ID ${id}`;
      console.error(`[BookService] deleteBook failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  getBookReviews: async (bookId: number): Promise<ReviewDto[]> => {
    try {
      const response = await api.get<ReviewDto[]>(`/Books/${bookId}/reviews`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to fetch reviews for book ID ${bookId}`;
      console.error(`[BookService] getBookReviews failed: ${errorMessage}`, error);
      throw error;
    }
  }
};