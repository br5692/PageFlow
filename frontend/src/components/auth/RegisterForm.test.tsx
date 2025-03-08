import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  
  it('renders register form with all fields', () => {
    renderRegisterForm();
    
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });
  
  it('shows password requirements when password field is touched', async () => {
    renderRegisterForm();
    
    // Enter something in password field to trigger validation
    const passwordField = screen.getByLabelText(/Password/i);
    fireEvent.change(passwordField, { target: { value: 'a' } });
    fireEvent.blur(passwordField);
    
    // Password requirements should be displayed
    await screen.findByText(/At least 8 characters/i);
    expect(screen.getByText(/At least one uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/At least one lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/At least one number/i)).toBeInTheDocument();
    expect(screen.getByText(/At least one special character/i)).toBeInTheDocument();
  });
  
  it('validates password match', async () => {
    renderRegisterForm();
    
    // Enter different passwords
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'DifferentPassword123!' }
    });
    
    fireEvent.blur(screen.getByLabelText(/Confirm Password/i));
    
    // Password mismatch error should be displayed
    const mismatchError = await screen.findByText(/Passwords must match/i);
    expect(mismatchError).toBeInTheDocument();
  });
  
  it('submits the form with valid data', async () => {
    // Setup successful registration
    mockRegister.mockResolvedValueOnce({});
    
    renderRegisterForm();
    
    // Enter valid form data
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'Password123!' }
    });
    
    // Select a role (Customer is default)
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
    // Wait for register to be called
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
    
    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
      role: 'Customer'
    });
    
    // Success message should show and navigation should happen after delay
    await screen.findByText(/Registration successful/i);
    expect(mockShowAlert).toHaveBeenCalledWith('success', expect.any(String));
    
    // Navigation happens after delay, hard to test exactly
  });
  
  it('shows error for duplicate email', async () => {
    // Setup registration failure for duplicate email
    mockRegister.mockRejectedValueOnce({
      response: { 
        data: [{ code: "DuplicateUserName" }]
      }
    });
    
    renderRegisterForm();
    
    // Enter form data
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'existing@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'Password123!' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
    // Error message should be displayed
    await screen.findByText(/This email is already registered/i);
    expect(mockShowAlert).toHaveBeenCalledWith('error', expect.any(String));
  });
  
  it('navigates to login page when login link is clicked', () => {
    renderRegisterForm();
    
    // Click the login link
    fireEvent.click(screen.getByText(/Already have an account\? Login/i));
    
    // Verify navigation to login page
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});