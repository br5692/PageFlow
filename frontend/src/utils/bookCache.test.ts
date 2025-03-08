import { bookCache } from './bookCache';
import { BookDto } from '../types/book.types';

// Mock Date.now to control time for testing cache expiry
const originalDateNow = Date.now;

describe('bookCache', () => {
  // Sample test books
  const testBooks: BookDto[] = [
    { 
      id: 1, 
      title: 'Test Book 1', 
      author: 'Test Author 1',
      isbn: '1234567890',
      publishedDate: '2023-01-01',
      description: 'Test description 1',
      coverImage: 'https://example.com/cover1.jpg',
      publisher: 'Test Publisher',
      category: 'Fiction',
      pageCount: 100,
      isAvailable: true,
      averageRating: 4.5
    },
    { 
      id: 2, 
      title: 'Test Book 2', 
      author: 'Test Author 2',
      isbn: '0987654321',
      publishedDate: '2023-01-02',
      description: 'Test description 2',
      coverImage: 'https://example.com/cover2.jpg',
      publisher: 'Test Publisher',
      category: 'Non-Fiction',
      pageCount: 200,
      isAvailable: false,
      averageRating: 3.5
    }
  ];

  beforeEach(() => {
    // Reset the cache before each test
    bookCache.clearCache();
    
    // Mock Date.now to return a consistent timestamp
    Date.now = jest.fn(() => 1625097600000); // July 1, 2021
  });

  afterAll(() => {
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  describe('getFeaturedBooks', () => {
    it('returns null when cache is empty', () => {
      expect(bookCache.getFeaturedBooks()).toBeNull();
    });

    it('returns the cached books when cache is not expired', () => {
      // Set the cache
      bookCache.setFeaturedBooks(testBooks);
      
      // Get the cached books
      const cachedBooks = bookCache.getFeaturedBooks();
      
      // Verify the books match
      expect(cachedBooks).toEqual(testBooks);
    });

    it('returns a deep copy of the cached books to prevent mutations', () => {
      // Set the cache
      bookCache.setFeaturedBooks(testBooks);
      
      // Get the cached books
      const cachedBooks = bookCache.getFeaturedBooks();
      
      // Verify we got a deep copy (not the same reference)
      expect(cachedBooks).not.toBe(testBooks);
      
      // Verify the copy contains the same data
      expect(cachedBooks).toEqual(testBooks);
      
      // Modify the returned copy
      if (cachedBooks) {
        cachedBooks[0].title = 'Modified Title';
      }
      
      // Verify the original cache was not affected
      const cachedBooksAfterModification = bookCache.getFeaturedBooks();
      expect(cachedBooksAfterModification?.[0].title).toBe('Test Book 1');
    });

    it('returns null when cache is expired', () => {
      // Set the cache
      bookCache.setFeaturedBooks(testBooks);
      
      // Fast-forward time to after cache expiry (1 hour + 1 second)
      const oneHourInMs = 60 * 60 * 1000;
      Date.now = jest.fn(() => 1625097600000 + oneHourInMs + 1000);
      
      // Cache should be considered expired
      expect(bookCache.getFeaturedBooks()).toBeNull();
    });
  });

  describe('setFeaturedBooks', () => {
    it('sets the books in the cache', () => {
      // Cache should be empty initially
      expect(bookCache.getFeaturedBooks()).toBeNull();
      
      // Set the cache
      bookCache.setFeaturedBooks(testBooks);
      
      // Verify the cache contains the books
      expect(bookCache.getFeaturedBooks()).toEqual(testBooks);
    });

    it('makes a deep copy of the books to prevent external mutations', () => {
      // Create a copy of the test books that we can modify
      const booksToModify = [...testBooks];
      
      // Set the cache
      bookCache.setFeaturedBooks(booksToModify);
      
      // Modify the original array
      booksToModify[0].title = 'Modified Title';
      
      // Verify the cache wasn't affected by the modification
      const cachedBooks = bookCache.getFeaturedBooks();
      expect(cachedBooks?.[0].title).toBe('Test Book 1');
    });
  });

  describe('clearCache', () => {
    it('clears the books from the cache', () => {
      // Set the cache
      bookCache.setFeaturedBooks(testBooks);
      
      // Verify the cache contains the books
      expect(bookCache.getFeaturedBooks()).toEqual(testBooks);
      
      // Clear the cache
      bookCache.clearCache();
      
      // Verify the cache is empty
      expect(bookCache.getFeaturedBooks()).toBeNull();
    });
  });
});