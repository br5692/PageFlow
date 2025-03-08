import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

// Mock the MUI components to make testing easier
jest.mock('@mui/material', () => ({
  Box: (props: { children?: ReactNode; [key: string]: any }) => 
    <div data-testid="box" {...props}>{props.children}</div>,
  CircularProgress: () => <div data-testid="circular-progress" />,
  Typography: (props: { children?: ReactNode; [key: string]: any }) => 
    <div data-testid="typography" {...props}>{props.children}</div>
}));

describe('Loading', () => {
  it('renders a loading indicator with default message', () => {
    render(<Loading />);
    
    // Check CircularProgress is rendered using RTL queries
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    
    // Check default message is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders a loading indicator with custom message', () => {
    const customMessage = 'Please wait...';
    render(<Loading message={customMessage} />);
    
    // Check CircularProgress is rendered using RTL queries
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    
    // Check custom message is displayed
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});