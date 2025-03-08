import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import PageTitle from './PageTitle';

// Mock MUI components
jest.mock('@mui/material', () => ({
  Typography: (props: { variant?: string; component?: string; children?: ReactNode; [key: string]: any }) => 
    <div data-testid={`typography-${props.variant}`} {...props}>
      {props.component === 'h1' ? <h1>{props.children}</h1> : props.children}
    </div>,
  Divider: (props: { [key: string]: any }) => 
    <div data-testid="divider" {...props} />
}));

describe('PageTitle', () => {
  it('renders the title', () => {
    render(<PageTitle title="Test Title" />);
    
    // Test that the title is rendered
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    
    // Test that it's an h1 component by checking for the heading role with level 1
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe('Test Title');
  });

  it('renders the title and subtitle', () => {
    render(<PageTitle title="Test Title" subtitle="Test Subtitle" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('includes a divider', () => {
    render(<PageTitle title="Test Title" />);
    
    // Check divider is rendered using RTL query
    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });
});