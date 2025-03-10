import { BookDto } from '../types/book.types';
import { bookService } from '../services/bookService';

// Cache keys for localStorage
const FEATURED_BOOKS_KEY = 'featuredBooks';
const FEATURED_TIMESTAMP_KEY = 'featuredBooksTimestamp';
const NEW_ARRIVALS_KEY = 'newArrivalsBooks';
const NEW_ARRIVALS_TIMESTAMP_KEY = 'newArrivalsTimestamp';

// Cache expiry time (1 hour in milliseconds)
const CACHE_EXPIRY = 60 * 60 * 1000;

export const bookCache = {
  // FEATURED BOOKS METHODS
  getFeaturedBooks(): BookDto[] | null {
    const timestamp = localStorage.getItem(FEATURED_TIMESTAMP_KEY);
    const cachedData = localStorage.getItem(FEATURED_BOOKS_KEY);
    
    // Return null if cache is expired or empty
    if (!cachedData || !timestamp || (Date.now() - parseInt(timestamp, 10) > CACHE_EXPIRY)) {
      return null;
    }
    
    // Return the cached books
    return JSON.parse(cachedData);
  },

  setFeaturedBooks(books: BookDto[]): void {
    // Store the books and timestamp
    localStorage.setItem(FEATURED_BOOKS_KEY, JSON.stringify(books));
    localStorage.setItem(FEATURED_TIMESTAMP_KEY, Date.now().toString());
  },

  // NEW ARRIVALS METHODS
  getNewArrivalsBooks(): BookDto[] | null {
    const timestamp = localStorage.getItem(NEW_ARRIVALS_TIMESTAMP_KEY);
    const cachedData = localStorage.getItem(NEW_ARRIVALS_KEY);
    
    // Return null if cache is expired or empty
    if (!cachedData || !timestamp || (Date.now() - parseInt(timestamp, 10) > CACHE_EXPIRY)) {
      return null;
    }
    
    // Return the cached books
    return JSON.parse(cachedData);
  },

  setNewArrivalsBooks(books: BookDto[]): void {
    // Store the books and timestamp
    localStorage.setItem(NEW_ARRIVALS_KEY, JSON.stringify(books));
    localStorage.setItem(NEW_ARRIVALS_TIMESTAMP_KEY, Date.now().toString());
  },

  // COMMON UTILITY METHODS
  clearCache(): void {
    localStorage.removeItem(FEATURED_BOOKS_KEY);
    localStorage.removeItem(FEATURED_TIMESTAMP_KEY);
    localStorage.removeItem(NEW_ARRIVALS_KEY);
    localStorage.removeItem(NEW_ARRIVALS_TIMESTAMP_KEY);
  },

  // New method to trigger storage events
  triggerStorageEvent(key: string): void {
    // Create a storage event for other components to listen to
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      storageArea: localStorage,
      // These values are needed but not important for our use case
      newValue: '{}', 
      oldValue: null,
      url: window.location.href
    }));
  },

  // New method to fetch replacement books
  async fetchBookReplacement(cacheKey: 'featured' | 'newArrivals', expectedCount: number): Promise<boolean> {
    // Get current cache
    const books = cacheKey === 'featured' ? this.getFeaturedBooks() : this.getNewArrivalsBooks();
    
    // If no books or count matches, nothing to do
    if (!books || books.length >= expectedCount) return false;
    
    // We need to fetch exactly how many are missing
    const missingCount = expectedCount - books.length;
    try {
      // Get existing IDs to exclude
      const existingIds = books.map(book => book.id);
      
      let newBooks: BookDto[] = [];
      if (cacheKey === 'featured') {
        // Fetch replacement for featured books
        const response = await bookService.getFeaturedBooks(missingCount * 2); // Get extra to ensure we find new ones
        newBooks = response.data.filter(book => !existingIds.includes(book.id)).slice(0, missingCount);
      } else {
        // Fetch replacement for new arrivals
        const response = await bookService.getAllBooks("id", false, 1, missingCount * 2);
        newBooks = response.data.filter(book => !existingIds.includes(book.id)).slice(0, missingCount);
      }
      
      // Add new books to cache if we found any
      if (newBooks.length > 0) {
        const updatedBooks = [...books, ...newBooks];
        if (cacheKey === 'featured') {
          this.setFeaturedBooks(updatedBooks);
          this.triggerStorageEvent(FEATURED_BOOKS_KEY);
        } else {
          this.setNewArrivalsBooks(updatedBooks);
          this.triggerStorageEvent(NEW_ARRIVALS_KEY);
        }
        return true; // Indicate we updated the cache
      }
    } catch (error) {
      console.error(`Error fetching replacement books for ${cacheKey}:`, error);
    }
    return false;
  },

  updateBookInCaches(bookId: number, updatedProperties: Partial<BookDto>): void {
    // Update in featured books cache if present
    const featuredBooks = this.getFeaturedBooks();
    if (featuredBooks) {
      const bookIndex = featuredBooks.findIndex(book => book.id === bookId);
      if (bookIndex !== -1) {
        featuredBooks[bookIndex] = {
          ...featuredBooks[bookIndex],
          ...updatedProperties
        };
        this.setFeaturedBooks(featuredBooks);
      }
    }
    
    // Update in new arrivals cache if present
    const newArrivals = this.getNewArrivalsBooks();
    if (newArrivals) {
      const bookIndex = newArrivals.findIndex(book => book.id === bookId);
      if (bookIndex !== -1) {
        newArrivals[bookIndex] = {
          ...newArrivals[bookIndex],
          ...updatedProperties
        };
        this.setNewArrivalsBooks(newArrivals);
      }
    }
  },

  removeBookFromCaches(bookId: number): void {
    // Remove from featured books cache if present
    const featuredBooks = this.getFeaturedBooks();
    if (featuredBooks) {
      const originalCount = featuredBooks.length;
      const updatedFeatured = featuredBooks.filter(book => book.id !== bookId);
      if (updatedFeatured.length > 0) {
        this.setFeaturedBooks(updatedFeatured);
        this.triggerStorageEvent(FEATURED_BOOKS_KEY);
        // Try to fetch a replacement immediately if book was removed
        if (updatedFeatured.length < originalCount) {
          this.fetchBookReplacement('featured', originalCount);
        }
      } else {
        localStorage.removeItem(FEATURED_BOOKS_KEY);
        localStorage.removeItem(FEATURED_TIMESTAMP_KEY);
        this.triggerStorageEvent(FEATURED_BOOKS_KEY);
      }
    }
    
    // Remove from new arrivals cache if present
    const newArrivals = this.getNewArrivalsBooks();
    if (newArrivals) {
      const originalCount = newArrivals.length;
      const updatedNewArrivals = newArrivals.filter(book => book.id !== bookId);
      if (updatedNewArrivals.length > 0) {
        this.setNewArrivalsBooks(updatedNewArrivals);
        this.triggerStorageEvent(NEW_ARRIVALS_KEY);
        // Try to fetch a replacement immediately if book was removed
        if (updatedNewArrivals.length < originalCount) {
          this.fetchBookReplacement('newArrivals', originalCount);
        }
      } else {
        localStorage.removeItem(NEW_ARRIVALS_KEY);
        localStorage.removeItem(NEW_ARRIVALS_TIMESTAMP_KEY);
        this.triggerStorageEvent(NEW_ARRIVALS_KEY);
      }
    }
  }
};