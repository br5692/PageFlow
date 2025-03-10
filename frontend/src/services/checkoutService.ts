import api from './api';
import { CheckoutDto } from '../types/checkout.types';
import { bookCache } from '../utils/bookCache';

export const checkoutService = {
  checkoutBook: async (bookId: number): Promise<CheckoutDto> => {
    try {
      const response = await api.post<CheckoutDto>(`/Checkouts/checkout/${bookId}`);
      bookCache.updateBookInCache(bookId, { isAvailable: false });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to checkout book with ID ${bookId}`;
      console.error(`[CheckoutService] checkoutBook failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  returnBook: async (checkoutId: number): Promise<CheckoutDto> => {
    try {
      const response = await api.post<CheckoutDto>(`/Checkouts/return/${checkoutId}`);
      bookCache.updateBookInCache(response.data.bookId, { isAvailable: true });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to return checkout with ID ${checkoutId}`;
      console.error(`[CheckoutService] returnBook failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  getCheckoutById: async (id: number): Promise<CheckoutDto> => {
    try {
      const response = await api.get<CheckoutDto>(`/Checkouts/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to fetch checkout with ID ${id}`;
      console.error(`[CheckoutService] getCheckoutById failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  getUserCheckouts: async (): Promise<CheckoutDto[]> => {
    try {
      const response = await api.get<CheckoutDto[]>('/Checkouts/user');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch user checkouts';
      console.error(`[CheckoutService] getUserCheckouts failed: ${errorMessage}`, error);
      throw error;
    }
  },
  
  getAllActiveCheckouts: async (): Promise<CheckoutDto[]> => {
    try {
      const response = await api.get<CheckoutDto[]>('/Checkouts/active');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch active checkouts';
      console.error(`[CheckoutService] getAllActiveCheckouts failed: ${errorMessage}`, error);
      throw error;
    }
  }

};