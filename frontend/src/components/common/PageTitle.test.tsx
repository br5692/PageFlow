import React from 'react';
import { render, screen } from '@testing-library/react';
import PageTitle from './PageTitle';

// The mock needs to be correctly configured to return JSX elements
jest.mock('@mui/material', () => ({
  Typography: ({ children, component, variant, ...props }: any) => {
    // Instead of dynamically creating components, just return a div with appropriate props
    return (
      <div data-testid={`typography-${variant}`} data-component={component} {...props}>
        {component === 'h1' ? <h1>{children}</h1> : children}
      </div>
    );
  },
  Divider: (props: any) => <div data-testid="divider" {...props} />,
  Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>
}));

describe('PageTitle', () => {
  it('renders the title', () => {
    render(<PageTitle title="Test Title" />);
    
    // Test that the title is rendered
    expect(screen.getByText('Test Title')).toBeInTheDocument();
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