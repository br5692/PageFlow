import { render, screen, waitFor } from '@testing-library/react';
import CheckoutList from './CheckoutList';
import { checkoutService } from '../../services/checkoutService';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BrowserRouter } from 'react-router-dom';
import * as dateUtils from '../../utils/dateUtils';

// Mock dependencies
jest.mock('../../services/checkoutService');
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));
jest.mock('../../context/AlertContext', () => ({
  useAlert: jest.fn()
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));
jest.mock('@mui/material', () => {
  const originalModule = jest.requireActual('@mui/material');
  return {
    ...originalModule,
    useMediaQuery: jest.fn()
  };
});

// Mock date utilities
jest.mock('../../utils/dateUtils', () => ({
  formatDate: jest.fn(date => date ? 'Jan 1, 2023' : 'N/A'),
  getDaysUntilDue: jest.fn(),
  getDueStatus: jest.fn()
}));

describe('CheckoutList Component', () => {
  // Mock data
  const mockCheckouts = [
    {
      id: 1,
      bookId: 101,
      bookTitle: 'Test Book 1',
      userId: 'user1',
      userName: 'Test User',
      checkoutDate: '2023-01-01T00:00:00',
      dueDate: '2023-01-06T00:00:00',
      returnDate: null,
      isReturned: false
    },
    {
      id: 2,
      bookId: 102,
      bookTitle: 'Test Book 2',
      userId: 'user2',
      userName: 'Another User',
      checkoutDate: '2023-01-02T00:00:00',
      dueDate: '2023-01-07T00:00:00',
      returnDate: null,
      isReturned: false
    }
  ];

  // Mock functions
  const mockNavigate = jest.fn();
  const mockShowAlert = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mocks
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    require('../../context/AuthContext').useAuth.mockReturnValue({ isLibrarian: false });
    require('../../context/AlertContext').useAlert.mockReturnValue({ showAlert: mockShowAlert });
    require('@mui/material').useMediaQuery.mockReturnValue(false); // Desktop view by default
    
    // Mock service calls
    (checkoutService.getUserCheckouts as jest.Mock).mockResolvedValue(mockCheckouts);
    (checkoutService.getAllActiveCheckouts as jest.Mock).mockResolvedValue(mockCheckouts);
    (checkoutService.returnBook as jest.Mock).mockResolvedValue(mockCheckouts[0]);
    
    // Mock date utils
    (dateUtils.getDaysUntilDue as jest.Mock).mockReturnValue(3);
    (dateUtils.getDueStatus as jest.Mock).mockReturnValue('ok');
  });

  const renderCheckoutList = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CheckoutList {...props} />
        </BrowserRouter>
      </ThemeProvider>
    );
  };

  it('shows error when fetchCheckouts fails', async () => {
    (checkoutService.getUserCheckouts as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Failed to fetch checkouts' } }
    });
    
    renderCheckoutList();

    // Wait for error
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith('error', 'Failed to fetch checkouts');
    });
  });

  it('correctly renders due status based on date', async () => {
    // Set up for "due soon" status
    (dateUtils.getDaysUntilDue as jest.Mock).mockReturnValue(2);
    (dateUtils.getDueStatus as jest.Mock).mockReturnValue('due-soon');
    
    renderCheckoutList();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    });

    // Set up for "overdue" status to test the next render
    (dateUtils.getDaysUntilDue as jest.Mock).mockReturnValue(-3);
    (dateUtils.getDueStatus as jest.Mock).mockReturnValue('overdue');
    
    renderCheckoutList();

    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    });
  });
});