import { authService } from './authService';
import api from './api';
import { LoginDto, RegisterDto, AuthResponseDto } from '../types/auth.types';

// Mock the API module
jest.mock('./api');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Auth Service', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });
  
  describe('login', () => {
    const mockLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const mockAuthResponse: AuthResponseDto = {
      success: true,
      message: 'Login successful',
      token: 'test-token',
      userId: 'user1',
      userName: 'Test User',
      role: 'Customer',
      expiration: new Date().toISOString()
    };
    
    test('should call api.post with correct parameters', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockAuthResponse });
      
      // Act
      await authService.login(mockLoginDto);
      
      // Assert
      expect(api.post).toHaveBeenCalledWith('/Auth/login', mockLoginDto);
    });
    
    test('should return auth response data on successful login', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({ data: mockAuthResponse });
      
      // Act
      const result = await authService.login(mockLoginDto);
      
      // Assert
      expect(result).toEqual(mockAuthResponse);
    });
    
    test('should throw error if login fails', async () => {
      // Arrange
      const mockError = new Error('Login failed');
      (api.post as jest.Mock).mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(authService.login(mockLoginDto)).rejects.toThrow(mockError);
    });
  });
  
  describe('register', () => {
    const mockRegisterDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      role: 'Customer'
    };
    
    test('should call api.post with correct parameters', async () => {
      // Arrange
      (api.post as jest.Mock).mockResolvedValue({});
      
      // Act
      await authService.register(mockRegisterDto);
      
      // Assert
      expect(api.post).toHaveBeenCalledWith('/Auth/register', mockRegisterDto);
    });
    
    test('should throw error if registration fails', async () => {
      // Arrange
      const mockError = new Error('Registration failed');
      (api.post as jest.Mock).mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(authService.register(mockRegisterDto)).rejects.toThrow(mockError);
    });
  });
  
  describe('logout', () => {
    test('should remove token and user from localStorage', () => {
      // Arrange
      localStorageMock.setItem('token', 'test-token');
      localStorageMock.setItem('user', JSON.stringify({ id: '1', name: 'Test User', role: 'Customer' }));
      
      // Act
      authService.logout();
      
      // Assert
      expect(localStorageMock.getItem('token')).toBeNull();
      expect(localStorageMock.getItem('user')).toBeNull();
    });
  });
  
  describe('storeAuthData', () => {
    test('should store token and user data in localStorage', () => {
      // Arrange
      const authData: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        token: 'test-token',
        userId: 'user1',
        userName: 'Test User',
        role: 'Customer',
        expiration: new Date().toISOString()
      };
      
      // Act
      authService.storeAuthData(authData);
      
      // Assert
      expect(localStorageMock.getItem('token')).toBe(authData.token);
      expect(localStorageMock.getItem('user')).toBe(JSON.stringify({
        id: authData.userId,
        name: authData.userName,
        role: authData.role
      }));
    });
  });
  
  describe('getUser', () => {
    test('should return user from localStorage if exists', () => {
      // Arrange
      const userData = { id: 'user1', name: 'Test User', role: 'Customer' };
      localStorageMock.setItem('user', JSON.stringify(userData));
      
      // Act
      const result = authService.getUser();
      
      // Assert
      expect(result).toEqual(userData);
    });
    
    test('should return null if user does not exist in localStorage', () => {
      // Act
      const result = authService.getUser();
      
      // Assert
      expect(result).toBeNull();
    });
    
    test('should return null if user data is not valid JSON', () => {
      // Arrange
      localStorageMock.setItem('user', 'invalid-json');
      
      // Act
      const result = authService.getUser();
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('isAuthenticated', () => {
    test('should return true when token exists', () => {
      // Arrange
      localStorageMock.setItem('token', 'test-token');
      
      // Act
      const result = authService.isAuthenticated();
      
      // Assert
      expect(result).toBe(true);
    });
    
    test('should return false when token does not exist', () => {
      // Act
      const result = authService.isAuthenticated();
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe('hasRole', () => {
    test('should return true when user exists and has the specified role', () => {
      // Arrange
      localStorageMock.setItem('user', JSON.stringify({ id: 'user1', name: 'Test User', role: 'Librarian' }));
      
      // Act
      const result = authService.hasRole('Librarian');
      
      // Assert
      expect(result).toBe(true);
    });
    
    test('should return false when user exists but does not have the specified role', () => {
      // Arrange
      localStorageMock.setItem('user', JSON.stringify({ id: 'user1', name: 'Test User', role: 'Customer' }));
      
      // Act
      const result = authService.hasRole('Librarian');
      
      // Assert
      expect(result).toBe(false);
    });
    
    test('should return false when user does not exist', () => {
      // Act
      const result = authService.hasRole('Librarian');
      
      // Assert
      expect(result).toBe(false);
    });
  });
});