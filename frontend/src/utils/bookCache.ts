import { BookDto } from '../types/book.types';
import { PaginatedResponse } from '../types/book.types';

// Cache for featured books
let featuredBooksCache: BookDto[] | null = null;

// Cache expiry time (1 hour in milliseconds)
const CACHE_EXPIRY = 60 * 60 * 1000;
let lastFetchTime: number = 0;

export const bookCache = {
  // Get cached featured books
  getFeaturedBooks(): BookDto[] | null {
    // Return null if cache is expired or empty
    if (!featuredBooksCache || Date.now() - lastFetchTime > CACHE_EXPIRY) {
      return null;
    }
    return featuredBooksCache;
  },

  // Set featured books in cache
  setFeaturedBooks(books: BookDto[]): void {
    featuredBooksCache = books;
    lastFetchTime = Date.now();
  },

  // Clear the cache (useful for testing or if needed)
  clearCache(): void {
    featuredBooksCache = null;
    lastFetchTime = 0;
  }
};