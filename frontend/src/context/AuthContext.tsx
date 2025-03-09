import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { LoginDto, RegisterDto, User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLibrarian: boolean;
  isCustomer: boolean;
  login: (credentials: LoginDto) => Promise<any>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null; // Exposed for convenience
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }

    // If there's an error from a previous login attempt stored in sessionStorage, pull it in
    const storedError = sessionStorage.getItem('loginError');
    if (storedError) {
      setError(storedError);
    }
  }, []);

  const login = async (credentials: LoginDto) => {
    setLoading(true); // Set loading true before try block to ensure it updates immediately
    try {
      setError(null);
      // Remove any existing stored error
      sessionStorage.removeItem('loginError');

      console.log('Attempting login with:', credentials.email);

      const response = await authService.login(credentials);
      console.log('Login response received');

      // Store new auth data
      authService.storeAuthData(response);
      setUser({
        id: response.userId,
        name: response.userName,
        role: response.role,
      });

      return response;
    } catch (err: any) {
      console.error('Login error in AuthContext:', err);

      // Use response message or fallback
      const errorMessage =
        err.response?.data?.message || 'Invalid email or password';

      // Store the error in sessionStorage so it persists on refresh
      sessionStorage.setItem('loginError', errorMessage);

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterDto) => {
    setLoading(true); // Set loading true before try block to ensure it updates immediately
    try {
      setError(null);
      await authService.register(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Ensure we're actually calling the authService.logout method
    authService.logout();
    setUser(null);

    // Clear any stored error
    sessionStorage.removeItem('loginError');
    setError(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLibrarian: user?.role === 'Librarian',
    isCustomer: user?.role === 'Customer',
    login,
    register,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};