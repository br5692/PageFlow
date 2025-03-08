import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  
  it('handles login success', async () => {
    const mockAuthResponse = {
      success: true,
      message: 'Login successful',
      token: 'test-token',
      userId: 'user1',
      userName: 'Test User',
      role: 'Customer',
      expiration: new Date().toISOString()
    };
    
    (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    userEvent.click(screen.getByTestId('login-button'));
    
    // Loading state should be true initially
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Verify services called correctly
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
    expect(authService.storeAuthData).toHaveBeenCalledWith(mockAuthResponse);
    
    // Verify user state updated
    expect(screen.getByTestId('user-id').textContent).toBe('user1');
    expect(screen.getByTestId('user-name').textContent).toBe('Test User');
    expect(screen.getByTestId('user-role').textContent).toBe('Customer');
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('is-customer').textContent).toBe('true');
  });
  
  it('handles login failure', async () => {
    const mockError = new Error('Invalid credentials');
    (authService.login as jest.Mock).mockRejectedValue(mockError);
    
    // Mock sessionStorage.setItem
    const sessionStorageSetItemMock = jest.spyOn(window.sessionStorage, 'setItem');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    userEvent.click(screen.getByTestId('login-button'));
    
    // Wait for login to fail
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Verify error was stored in sessionStorage
    expect(sessionStorageSetItemMock).toHaveBeenCalledWith('loginError', 'Invalid email or password');
  });
  
  it('handles registration', async () => {
    (authService.register as jest.Mock).mockResolvedValue(undefined);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    userEvent.click(screen.getByTestId('register-button'));
    
    // Loading state should be true initially
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Wait for registration to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Verify service called correctly
    expect(authService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      role: 'Customer'
    });
  });
  
  it('handles logout', () => {
    // Mock a logged in user
    const mockUser = { id: 'user1', name: 'Test User', role: 'Customer' };
    (authService.getUser as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verify user is logged in
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    
    // Logout
    userEvent.click(screen.getByTestId('logout-button'));
    
    // Verify logout was called
    expect(authService.logout).toHaveBeenCalled();
    
    // Verify user state was updated
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-id').textContent).toBe('no-user');
  });
});