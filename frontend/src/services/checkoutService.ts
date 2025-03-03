import api from './api';
import { CheckoutDto } from '../types/checkout.types';

export const checkoutService = {
  checkoutBook: async (bookId: number): Promise<CheckoutDto> => {
    const response = await api.post<CheckoutDto>(`/Checkouts/checkout/${bookId}`);
    return response.data;
  },
  
  returnBook: async (checkoutId: number): Promise<CheckoutDto> => {
    const response = await api.post<CheckoutDto>(`/Checkouts/return/${checkoutId}`);
    return response.data;
  },
  
  getCheckoutById: async (id: number): Promise<CheckoutDto> => {
    const response = await api.get<CheckoutDto>(`/Checkouts/${id}`);
    return response.data;
  },
  
  getUserCheckouts: async (): Promise<CheckoutDto[]> => {
    const response = await api.get<CheckoutDto[]>('/Checkouts/user');
    return response.data;
  },
  
  getAllActiveCheckouts: async (): Promise<CheckoutDto[]> => {
    const response = await api.get<CheckoutDto[]>('/Checkouts/active');
    return response.data;
  }
};