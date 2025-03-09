import React from 'react';
import { render, screen} from '@testing-library/react';
import { AlertProvider, useAlert } from './AlertContext';

// Helper component to test the useAlert hook
const TestComponent = () => {
  const { alert, showAlert, hideAlert } = useAlert();
  
  return (
    <div>
      <div data-testid="alert-type">{alert?.type}</div>
      <div data-testid="alert-message">{alert?.message}</div>
      <button data-testid="show-success" onClick={() => showAlert('success', 'Success message')}>
        Show Success
      </button>
      <button data-testid="show-error" onClick={() => showAlert('error', 'Error message')}>
        Show Error
      </button>
      <button data-testid="hide-alert" onClick={hideAlert}>
        Hide
      </button>
    </div>
  );
};

describe('AlertContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  it('provides null alert by default', () => {
    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );
    
    expect(screen.getByTestId('alert-type').textContent).toBe('');
    expect(screen.getByTestId('alert-message').textContent).toBe('');
  });

  it('throws error when useAlert is used outside AlertProvider', () => {
    // Mock console.error to prevent React error logs in test output
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    expect(() => render(<TestComponent />)).toThrow(
      'useAlert must be used within an AlertProvider'
    );
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});