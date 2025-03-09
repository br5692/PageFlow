import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import RegisterForm from './RegisterForm';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the AlertContext
jest.mock('../../context/AlertContext', () => ({
  useAlert: jest.fn(),
}));

// Setup mocks
const mockNavigate = jest.fn();
const mockRegister = jest.fn();
const mockShowAlert = jest.fn();

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    require('../../context/AuthContext').useAuth.mockReturnValue({
      register: mockRegister,
      loading: false,
    });
    
    require('../../context/AlertContext').useAlert.mockReturnValue({
      showAlert: mockShowAlert,
    });
  });
  
  const renderRegisterForm = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <RegisterForm />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('navigates to login page when login link is clicked', () => {
    renderRegisterForm();
    
    // Click the login link
    fireEvent.click(screen.getByText(/Already have an account\? Login/i));
    
    // Verify navigation to login page
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});