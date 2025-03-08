import React, { PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AlertProvider } from '../context/AlertContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';

// Custom render function that includes providers
const AllTheProviders = ({ children }: PropsWithChildren<{}>) => {
  return (
    <ThemeProvider theme={theme}>
      <AlertProvider>
        <AuthProvider>
          <Router>{children}</Router>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock user with different roles
export const mockCustomerUser = {
  id: 'user-123',
  name: 'Test Customer',
  role: 'Customer',
};

export const mockLibrarianUser = {
  id: 'user-456',
  name: 'Test Librarian', 
  role: 'Librarian',
};

// Helper to mock authenticated state
export const mockAuthState = (user = mockCustomerUser) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', 'mock-token');
};

// Helper to clear auth state
export const clearAuthState = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};