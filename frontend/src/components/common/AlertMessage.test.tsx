import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlertMessage from './AlertMessage';
import { AlertProvider, useAlert } from '../../context/AlertContext';

// Mock MUI Snackbar and Alert components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Snackbar: (props: { 
    children?: ReactNode; 
    open?: boolean; 
    onClose?: () => void;
    [key: string]: any;
  }) => (
    props.open ? <div data-testid="snackbar" onClick={props.onClose}>{props.children}</div> : null
  ),
  Alert: (props: { 
    severity?: 'success' | 'error' | 'warning' | 'info'; 
    onClose?: () => void; 
    children?: ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid={`alert-${props.severity}`} onClick={props.onClose}>{props.children}</div>
  )
}));

// Helper component to control the alert
const TestComponent = () => {
  const { showAlert } = useAlert();
  
  return (
    <div>
      <button 
        data-testid="show-success" 
        onClick={() => showAlert('success', 'Success message')}
      >
        Show Success
      </button>
      <button 
        data-testid="show-error" 
        onClick={() => showAlert('error', 'Error message')}
      >
        Show Error
      </button>
      <AlertMessage />
    </div>
  );
};

describe('AlertMessage', () => {
  it('does not render when no alert is shown', () => {
    render(
      <AlertProvider>
        <AlertMessage />
      </AlertProvider>
    );
    
    const snackbar = screen.queryByTestId('snackbar');
    expect(snackbar).not.toBeInTheDocument();
  });

  it('renders success alert when shown', () => {
    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );
    
    // Show success alert
    userEvent.click(screen.getByTestId('show-success'));
    
    // Check alert is rendered
    const successAlert = screen.getByTestId('alert-success');
    expect(successAlert).toBeInTheDocument();
    expect(successAlert.textContent).toBe('Success message');
  });

  it('renders error alert when shown', () => {
    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );
    
    // Show error alert
    userEvent.click(screen.getByTestId('show-error'));
    
    // Check alert is rendered
    const errorAlert = screen.getByTestId('alert-error');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert.textContent).toBe('Error message');
  });

  it('closes alert when clicked', () => {
    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );
    
    // Show success alert
    userEvent.click(screen.getByTestId('show-success'));
    
    // Check alert is rendered
    expect(screen.getByTestId('alert-success')).toBeInTheDocument();
    
    // Click on alert to close it
    userEvent.click(screen.getByTestId('snackbar'));
    
    // Check alert is no longer rendered
    expect(screen.queryByTestId('alert-success')).not.toBeInTheDocument();
  });
});