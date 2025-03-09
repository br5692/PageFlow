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
});