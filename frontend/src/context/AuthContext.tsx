import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { LoginDto, RegisterDto, User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLibrarian: boolean;
  isCustomer: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginDto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      authService.storeAuthData(response);
      setUser({
        id: response.userId,
        name: response.userName,
        role: response.role
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterDto) => {
    try {
      setLoading(true);
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
    authService.logout();
    setUser(null);
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
    error
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