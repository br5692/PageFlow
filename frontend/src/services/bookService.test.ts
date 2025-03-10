import { bookService } from './bookService';
import api from './api';
import { bookCache } from '../utils/bookCache';
import { BookDto, BookCreateDto, BookUpdateDto, PaginatedResponse } from '../types/book.types';

// Mock the API module and bookCache
jest.mock('./api');
jest.mock('../utils/bookCache');

describe('Book Service', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getAllBooks', () => {
    const mockResponse: PaginatedResponse<BookDto> = {
      data: [
        { id: 1, title: 'Book 1', author: 'Author 1', isbn: '1234', publishedDate: '2023-01-01', description: 'Description 1', coverImage: 'image1.jpg', publisher: 'Publisher 1', category: 'Fiction', pageCount: 200, isAvailable: true, averageRating: 4.5 },
        { id: 2, title: 'Book 2', author: 'Author 2', isbn: '5678', publishedDate: '2023-02-01', description: 'Description 2', coverImage: 'image2.jpg', publisher: 'Publisher 2', category: 'Non-Fiction', pageCount: 300, isAvailable: false, averageRating: 3.5 }
      ],
      totalCount: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1
    };
    
    test('should call api.get with correct parameters', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // Act
      await bookService.getAllBooks('title', true, 1, 10);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/Books', { 
        params: { sortBy: 'title', ascending: true, page: 1, pageSize: 10 } 
      });
    });
    
    test('should use default parameters if not provided', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // Act
      await bookService.getAllBooks();
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/Books', { 
        params: { sortBy: undefined, ascending: true, page: 1, pageSize: 20 } 
      });
    });
    
    test('should return paginated book data', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // Act
      const result = await bookService.getAllBooks();
      
      // Assert
      expect(result).toEqual(mockResponse);
    });
    
    test('should throw error if API call fails', async () => {
      // Arrange
      const mockError = new Error('Failed to fetch books');
      (api.get as jest.Mock).mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(bookService.getAllBooks()).rejects.toThrow(mockError);
    });
  });
  
  describe('getFeaturedBooks', () => {
    const mockResponse: PaginatedResponse<BookDto> = {
      data: [
        { id: 1, title: 'Featured Book 1', author: 'Author 1', isbn: '1234', publishedDate: '2023-01-01', description: 'Description 1', coverImage: 'image1.jpg', publisher: 'Publisher 1', category: 'Fiction', pageCount: 200, isAvailable: true, averageRating: 4.5 }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 4,
      totalPages: 1
    };
    
    test('should call api.get with correct parameters', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // Act
      await bookService.getFeaturedBooks(5);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/Books/featured', { 
        params: { count: 5, availableOnly: true } 
      });
    });
    
    test('should use default count if not provided', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // Act
      await bookService.getFeaturedBooks();
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/Books/featured', { 
        params: { count: 4, availableOnly: true } 
      });
    });
    
    test('should return featured books data', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // Act
      const result = await bookService.getFeaturedBooks();
      
      // Assert
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('searchBooks', () => {
    const mockResponse: PaginatedResponse<BookDto> = {
      data: [
        { id: 1, title: 'Search Result', author: 'Author 1', isbn: '1234', publishedDate: '2023-01-01', description: 'Description 1', coverImage: 'image1.jpg', publisher: 'Publisher 1', category: 'Fiction', pageCount: 200, isAvailable: true, averageRating: 4.5 }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1
    };
    
    test('should call api.get with search parameters', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      const searchParams = { query: 'test', category: 'Fiction', author: 'Author' };
      
      // Act
      await bookService.searchBooks(searchParams);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/Books/search', { params: searchParams });
    });
    
    test('should return search results', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // Act
      const result = await bookService.searchBooks({ query: 'test' });
      
      // Assert
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('getBookById', () => {
    const mockBook: BookDto = {
      id: 1, 
      title: 'Book 1', 
      author: 'Author 1', 
      isbn: '1234', 
      publishedDate: '2023-01-01', 
      description: 'Description 1', 
      coverImage: 'image1.jpg', 
      publisher: 'Publisher 1', 
      category: 'Fiction', 
      pageCount: 200, 
      isAvailable: true, 
      averageRating: 4.5
    };
    
    test('should call api.get with correct URL', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockBook });
      
      // Act
      await bookService.getBookById(1);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/Books/1');
    });
    
    test('should return book data', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockBook });
      
      // Act
      const result = await bookService.getBookById(1);
      
      // Assert
      expect(result).toEqual(mockBook);
    });
  });
  
  describe('createBook', () => {
    const mockBookCreate: BookCreateDto = {
      title: 'New Book',
      author: 'New Author',
      isbn: '1234',
      publishedDate: '2023-01-01',
      description: 'New Description',
      coverImage: 'new-image.jpg',
      publisher: 'New Publisher',
      category: 'Fiction',
      pageCount: 200
    };
    
    const mockCreatedBook: BookDto = {
      ...mockBookCreate,
      id: 3,
      isAvailable: true,
      averageRating: 0
    };
    
    test('should call api.post with book data', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockCreatedBook });
      
      // Act
      await bookService.createBook(mockBookCreate);
      
      // Assert
      expect(api.post).toHaveBeenCalledWith('/Books', mockBookCreate);
    });
    
    test('should return created book data', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockCreatedBook });
      
      // Act
      const result = await bookService.createBook(mockBookCreate);
      
      // Assert
      expect(result).toEqual(mockCreatedBook);
    });
  });
  
  describe('updateBook', () => {
    const mockBookUpdate: BookUpdateDto = {
      id: 1,
      title: 'Updated Book',
      author: 'Updated Author',
      isbn: '1234',
      publishedDate: '2023-01-01',
      description: 'Updated Description',
      coverImage: 'updated-image.jpg',
      publisher: 'Updated Publisher',
      category: 'Fiction',
      pageCount: 200
    };
    
    const mockUpdatedBook: BookDto = {
      ...mockBookUpdate,
      isAvailable: true,
      averageRating: 4.5
    };
    
    test('should call api.put with book data', async () => {
      // Arrange
      (api.put as jest.Mock).mockResolvedValue({ data: mockUpdatedBook });
      
      // Act
      await bookService.updateBook(mockBookUpdate);
      
      // Assert
      expect(api.put).toHaveBeenCalledWith('/Books', mockBookUpdate);
    });
    
    test('should return updated book data', async () => {
      // Arrange
      (api.put as jest.Mock).mockResolvedValue({ data: mockUpdatedBook });
      
      // Act
      const result = await bookService.updateBook(mockBookUpdate);
      
      // Assert
      expect(result).toEqual(mockUpdatedBook);
    });
  });
  
  describe('deleteBook', () => {
    test('should call api.delete with book ID', async () => {
      // Arrange
      (api.delete as jest.Mock).mockResolvedValue({});
      
      // Act
      await bookService.deleteBook(1);
      
      // Assert
      expect(api.delete).toHaveBeenCalledWith('/Books/1');
    });
    
    test('should remove the specific book from cache after deletion', async () => {
      // Arrange
      (api.delete as jest.Mock).mockResolvedValue({});
      
      // Act
      await bookService.deleteBook(1);
      
      // Assert
      expect(bookCache.removeBookFromCache).toHaveBeenCalledWith(1);
    });
  });
  
  describe('getBookReviews', () => {
    const mockReviews = [
      { id: 1, bookId: 1, userId: 'user1', userName: 'User 1', rating: 4, comment: 'Great book', createdAt: '2023-01-01' }
    ];
    
    test('should call api.get with correct URL', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockReviews });
      
      // Act
      await bookService.getBookReviews(1);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/Books/1/reviews');
    });
    
    test('should return reviews data', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockReviews });
      
      // Act
      const result = await bookService.getBookReviews(1);
      
      // Assert
      expect(result).toEqual(mockReviews);
    });
  });
});