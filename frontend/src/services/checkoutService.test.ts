import { checkoutService } from './checkoutService';
import api from './api';
import { CheckoutDto } from '../types/checkout.types';

// Mock the API module
jest.mock('./api');

describe('Checkout Service', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCheckout: CheckoutDto = {
    id: 1,
    bookId: 1,
    bookTitle: 'Test Book',
    userId: 'user1',
    userName: 'Test User',
    checkoutDate: '2023-01-01T00:00:00',
    dueDate: '2023-01-06T00:00:00',
    returnDate: null,
    isReturned: false
  };

  const mockReturnedCheckout: CheckoutDto = {
    ...mockCheckout,
    returnDate: '2023-01-05T00:00:00',
    isReturned: true
  };

  describe('checkoutBook', () => {
    test('should call api.post with correct bookId', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockCheckout });

      // Act
      await checkoutService.checkoutBook(1);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/Checkouts/checkout/1');
    });

    test('should return checkout data', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockCheckout });

      // Act
      const result = await checkoutService.checkoutBook(1);

      // Assert
      expect(result).toEqual(mockCheckout);
    });

    test('should throw error if API call fails', async () => {
      // Arrange
      const mockError = new Error('Failed to checkout book');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(checkoutService.checkoutBook(1)).rejects.toThrow(mockError);
    });
  });

  describe('returnBook', () => {
    test('should call api.post with correct checkoutId', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockReturnedCheckout });

      // Act
      await checkoutService.returnBook(1);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/Checkouts/return/1');
    });

    test('should return updated checkout data with returnDate', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockReturnedCheckout });

      // Act
      const result = await checkoutService.returnBook(1);

      // Assert
      expect(result).toEqual(mockReturnedCheckout);
      expect(result.returnDate).not.toBeNull();
      expect(result.isReturned).toBe(true);
    });
  });

  describe('getCheckoutById', () => {
    test('should call api.get with correct URL', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockCheckout });

      // Act
      await checkoutService.getCheckoutById(1);

      // Assert
      expect(api.get).toHaveBeenCalledWith('/Checkouts/1');
    });

    test('should return checkout data', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockCheckout });

      // Act
      const result = await checkoutService.getCheckoutById(1);

      // Assert
      expect(result).toEqual(mockCheckout);
    });
  });

  describe('getUserCheckouts', () => {
    const mockCheckouts = [mockCheckout];

    test('should call api.get with correct URL', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockCheckouts });

      // Act
      await checkoutService.getUserCheckouts();

      // Assert
      expect(api.get).toHaveBeenCalledWith('/Checkouts/user');
    });

    test('should return array of user checkouts', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockCheckouts });

      // Act
      const result = await checkoutService.getUserCheckouts();

      // Assert
      expect(result).toEqual(mockCheckouts);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getAllActiveCheckouts', () => {
    const mockActiveCheckouts = [mockCheckout];

    test('should call api.get with correct URL', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockActiveCheckouts });

      // Act
      await checkoutService.getAllActiveCheckouts();

      // Assert
      expect(api.get).toHaveBeenCalledWith('/Checkouts/active');
    });

    test('should return array of active checkouts', async () => {
      // Arrange
      (api.get as jest.Mock).mockResolvedValue({ data: mockActiveCheckouts });

      // Act
      const result = await checkoutService.getAllActiveCheckouts();

      // Assert
      expect(result).toEqual(mockActiveCheckouts);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});