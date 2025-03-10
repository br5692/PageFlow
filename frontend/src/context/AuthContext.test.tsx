import { render, screen} from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';

// Mock authService
jest.mock('../services/authService');

// Helper component to test the useAuth hook
const TestComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    isLibrarian, 
    isCustomer, 
    login, 
    register, 
    logout, 
    loading, 
    error 
  } = useAuth();
  
  return (
    <div>
      <div data-testid="user-id">{user?.id || 'no-user'}</div>
      <div data-testid="user-name">{user?.name || 'no-name'}</div>
      <div data-testid="user-role">{user?.role || 'no-role'}</div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="is-librarian">{isLibrarian ? 'true' : 'false'}</div>
      <div data-testid="is-customer">{isCustomer ? 'true' : 'false'}</div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      
      <button 
        data-testid="login-button" 
        onClick={() => login({ email: 'test@example.com', password: 'password' })}
      >
        Login
      </button>
      
      <button 
        data-testid="register-button" 
        onClick={() => register({ email: 'test@example.com', password: 'password', role: 'Customer' })}
      >
        Register
      </button>
      
      <button 
        data-testid="logout-button" 
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up a mock implementation for sessionStorage.getItem
    jest.spyOn(window.sessionStorage, 'getItem').mockImplementation((key) => {
      if (key === 'loginError') return null;
      return null;
    });
    
    // Set up a mock implementation for authService.getUser
    (authService.getUser as jest.Mock).mockReturnValue(null);
  });
  
  it('provides default values when no user is authenticated', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-id').textContent).toBe('no-user');
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('is-librarian').textContent).toBe('false');
    expect(screen.getByTestId('is-customer').textContent).toBe('false');
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('error').textContent).toBe('no-error');
  });
  
  it('loads user from authService on initialization', () => {
    // Mock a logged in user
    const mockUser = { id: 'user1', name: 'Test User', role: 'Customer' };
    (authService.getUser as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-id').textContent).toBe('user1');
    expect(screen.getByTestId('user-name').textContent).toBe('Test User');
    expect(screen.getByTestId('user-role').textContent).toBe('Customer');
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('is-librarian').textContent).toBe('false');
    expect(screen.getByTestId('is-customer').textContent).toBe('true');
  });
  
  it('loads error from sessionStorage on initialization', () => {
    // Mock an error in sessionStorage
    jest.spyOn(window.sessionStorage, 'getItem').mockImplementation((key) => {
      if (key === 'loginError') return 'Invalid credentials';
      return null;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
  });
});