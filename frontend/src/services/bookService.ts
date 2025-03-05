import api from './api';
import { BookDto, BookCreateDto, BookUpdateDto, BookFilterParams } from '../types/book.types';
import { ReviewDto } from '../types/review.types';

// Cache for filter options
let categoryCache: string[] = [];
let authorCache: string[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1 * 60 * 1000; // 5 minutes
const bookCache: Record<string, { data: any, timestamp: number }> = {};

export const bookService = {
  getAllBooks: async (
    sortBy?: string, 
    ascending: boolean = true, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<{ books: BookDto[], totalCount: number }> => {
    const cacheKey = `books-${sortBy}-${ascending}-${page}-${pageSize}`;
    const now = Date.now();
    
    // Check cache first
    if (bookCache[cacheKey] && (now - bookCache[cacheKey].timestamp < CACHE_DURATION)) {
      return bookCache[cacheKey].data;
    }
    
    // If not in cache or expired, fetch from API
    const params = { sortBy, ascending, page, pageSize };
    const response = await api.get<any>('/Books', { params });
    
    // Format the response
    const formattedResponse = Array.isArray(response.data) 
      ? { books: response.data, totalCount: response.data.length }
      : response.data;
    
    // Cache the result
    bookCache[cacheKey] = {
      data: formattedResponse,
      timestamp: now
    };
    
    return formattedResponse;
  },
  
  searchBooks: async (
    params: BookFilterParams & { page?: number, pageSize?: number }
  ): Promise<{ books: BookDto[], totalCount: number }> => {
    const cacheKey = `search-${JSON.stringify(params)}`;
    const now = Date.now();
    
    // Check cache first
    if (bookCache[cacheKey] && (now - bookCache[cacheKey].timestamp < CACHE_DURATION)) {
      return bookCache[cacheKey].data;
    }
    
    // If not in cache or expired, fetch from API
    const response = await api.get<any>('/Books/search', { params });
    
    // Format the response
    const formattedResponse = Array.isArray(response.data) 
      ? { books: response.data, totalCount: response.data.length }
      : response.data;
    
    // Cache the result
    bookCache[cacheKey] = {
      data: formattedResponse,
      timestamp: now
    };
    
    return formattedResponse;
  },
  getFeaturedBooks: async (
    count: number = 10,
    minRating: number = 4.0,
    availableOnly: boolean = true
  ): Promise<BookDto[]> => {
    const params = { count, minRating, availableOnly };
    const response = await api.get<BookDto[]>('/Books/featured', { params });
    return response.data;
  },
  
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
  },
  getFilterOptions: async (): Promise<{ categories: string[], authors: string[] }> => {
    const now = Date.now();
    
    // Use cache if available and not expired
    if (categoryCache.length > 0 && authorCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
      return { categories: categoryCache, authors: authorCache };
    }
    
    // Otherwise fetch fresh data (use a small page size since we only need unique values)
    const response = await bookService.getAllBooks(undefined, true, 1, 100);
    const books = response.books || [];
    
    // Process categories and authors with proper type guards
    const categories = [...new Set(books
      .map(book => book.category)
      .filter((category): category is string => typeof category === 'string' && category !== '')
    )];
    
    const authors = [...new Set(books
      .map(book => book.author)
      .filter((author): author is string => typeof author === 'string' && author !== '')
    )];
    
    // Update cache
    categoryCache = categories;
    authorCache = authors;
    cacheTimestamp = now;
    
    return { categories, authors };
  }
};