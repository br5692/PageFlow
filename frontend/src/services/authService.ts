import api from './api';
import { LoginDto, RegisterDto, AuthResponseDto, User } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginDto): Promise<AuthResponseDto> => {
    try {
      const response = await api.post<AuthResponseDto>('/Auth/login', credentials);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error(`[AuthService] login failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  register: async (userData: RegisterDto): Promise<void> => {
    try {
      await api.post('/Auth/register', userData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      console.error(`[AuthService] register failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  storeAuthData: (authData: AuthResponseDto): void => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify({
      id: authData.userId,
      name: authData.userName,
      role: authData.role
    }));
  },
  
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error: any) {
      console.error('[AuthService] getUser failed: Error parsing user data', error);
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  },
  
  hasRole: (role: string): boolean => {
    const user = authService.getUser();
    return user !== null && user.role === role;
  }
};