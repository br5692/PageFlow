import { BookDto } from '../types/book.types';

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
    
    // Create a deep copy of the cached books
    return JSON.parse(JSON.stringify(featuredBooksCache));
  },

  // Set featured books in cache
  setFeaturedBooks(books: BookDto[]): void {
    // Store a deep copy of the books to ensure immutability
    featuredBooksCache = JSON.parse(JSON.stringify(books));
    lastFetchTime = Date.now();
  },

  // Clear the cache (useful for testing or if needed)
  clearCache(): void {
    featuredBooksCache = null;
    lastFetchTime = 0;
  },

  // Update a specific book in the cache
  updateBookInCache(bookId: number, updatedProperties: Partial<BookDto>): void {
    if (!featuredBooksCache) return;
    
    // Find the book in the cache
    const bookIndex = featuredBooksCache.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
      // Create a new book object with updated properties
      featuredBooksCache[bookIndex] = {
        ...featuredBooksCache[bookIndex],
        ...updatedProperties
      };
      
      // Reset the lastFetchTime to extend the cache validity
      lastFetchTime = Date.now();
    }
  },
  
  // Remove a specific book from the cache
  removeBookFromCache(bookId: number): void {
    if (!featuredBooksCache) return;
    
    // Filter out the deleted book from the cache
    featuredBooksCache = featuredBooksCache.filter(book => book.id !== bookId);
    
    // Reset the lastFetchTime to extend the cache validity
    if (featuredBooksCache.length > 0) {
      lastFetchTime = Date.now();
    }
  }
};