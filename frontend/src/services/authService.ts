import api from './api';
import { LoginDto, RegisterDto, AuthResponseDto, User } from '../types/auth.types';

export const authService = {
  // login: async (credentials: LoginDto): Promise<AuthResponseDto> => {
  //   const response = await api.post<AuthResponseDto>('/Auth/login', credentials);
  //   return response.data;
  // },

  login: async (credentials: LoginDto): Promise<any> => {
    try {
      const response = await api.post<AuthResponseDto>('/Auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Auth service login error:', error);
      throw error; // Make sure to re-throw the error
    }
  },
  
  register: async (userData: RegisterDto): Promise<void> => {
    await api.post('/Auth/register', userData);
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
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  
  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  },
  
  hasRole: (role: string): boolean => {
    const user = authService.getUser();
    return user !== null && user.role === role;
  }
};