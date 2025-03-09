import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import AlertMessage from './AlertMessage';
import { AlertProvider} from '../../context/AlertContext';

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