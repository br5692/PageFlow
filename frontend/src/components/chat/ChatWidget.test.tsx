import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import ChatWidget from './ChatWidget';
import * as signalR from '@microsoft/signalr';
import { HubConnectionState } from '@microsoft/signalr';

// Mock dependencies
jest.mock('../../context/AuthContext');
jest.mock('@microsoft/signalr');
jest.mock('../../services/api', () => ({
  API_BASE_URL: 'http://localhost:5096/api'
}));

// Mock HubConnectionBuilder and connection
const mockConnection = {
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  off: jest.fn(),
  onclose: jest.fn(),
  invoke: jest.fn().mockResolvedValue(undefined),
  state: HubConnectionState.Connected
};

const mockHubConnectionBuilder = {
  withUrl: jest.fn().mockReturnThis(),
  withAutomaticReconnect: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue(mockConnection)
};

describe('ChatWidget Component', () => {
  // Set up our mocks before each test

  // Mock scrollIntoView() to prevent Jest errors
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default auth context mock
    require('../../context/AuthContext').useAuth.mockReturnValue({
      user: { id: 'user1', name: 'Test User' },
      isAuthenticated: true
    });
    
    // Setup SignalR mocks
    (signalR.HubConnectionBuilder as jest.Mock).mockImplementation(() => mockHubConnectionBuilder);
  });

  it('renders nothing when user is not authenticated', () => {
    // Mock unauthenticated state
    require('../../context/AuthContext').useAuth.mockReturnValue({
      isAuthenticated: false
    });
    
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
    
    // Should not render anything
    expect(screen.queryByRole('button', { name: /chat/i })).not.toBeInTheDocument();
  });

  it('renders chat button when user is authenticated', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
    
    // Chat button should be visible
    const chatButton = screen.getByRole('button', { name: /chat/i });
    expect(chatButton).toBeInTheDocument();
  });

  it('initializes SignalR connection when chat window opens', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
    
    // Should initialize connection
    expect(signalR.HubConnectionBuilder).toHaveBeenCalled();
    expect(mockHubConnectionBuilder.withUrl).toHaveBeenCalledWith(
      'http://localhost:5096/chatHub', 
      expect.objectContaining({
        skipNegotiation: true
      })
    );
    expect(mockConnection.start).toHaveBeenCalled();
    
    // Should register message handler
    await waitFor(() => {
      expect(mockConnection.on).toHaveBeenCalledWith('ReceiveMessage', expect.any(Function));
    });
    
    // Should show welcome message
    await waitFor(() => {
      expect(screen.getByText(/Hello! I can help you find books/i)).toBeInTheDocument();
    });
  });

  it('sends messages when user submits text', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
  
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
  
    // Wait for connection to be established
    await waitFor(() => {
      expect(mockConnection.on).toHaveBeenCalled();
    });
  
    // Type a message
    const inputField = screen.getByPlaceholderText('Ask me about books...');
    await userEvent.type(inputField, 'Hello, BookBot!');
  
    // Send message using button
    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);
  
    // Should invoke the SendMessage method
    expect(mockConnection.invoke).toHaveBeenCalledWith('SendMessage', 'Test User', 'Hello, BookBot!');
  
    // ✅ Fix: Wait for state updates before asserting input clearing
    await waitFor(() => {
      expect(inputField).toHaveValue('');
    });
  });
  

  it('sends messages when user presses Enter', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
    
    // Wait for connection to be established
    await waitFor(() => {
      expect(mockConnection.on).toHaveBeenCalled();
    });
    
    // Type a message and press Enter
    const inputField = screen.getByPlaceholderText('Ask me about books...');
    fireEvent.change(inputField, { target: { value: 'Hello, BookBot!' } });
    fireEvent.keyPress(inputField, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Should invoke the SendMessage method
    expect(mockConnection.invoke).toHaveBeenCalledWith('SendMessage', 'Test User', 'Hello, BookBot!');
  });

  it('displays received messages from server', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
  
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
  
    // Wait for connection to be established and handler to be registered
    await waitFor(() => {
      expect(mockConnection.on).toHaveBeenCalledWith('ReceiveMessage', expect.any(Function));
    });
  
    // Extract the message handler
    const messageHandler = mockConnection.on.mock.calls.find(
      call => call[0] === 'ReceiveMessage'
    )[1];
  
    // Simulate receiving a message
    act(() => {
      messageHandler('BookBot', 'Here are some book recommendations', true);
    });
  
    // Use `getAllByText` to handle multiple "BookBot" instances
    expect(await screen.findByText('Here are some book recommendations')).toBeInTheDocument();
    expect((await screen.findAllByText('BookBot')).length).toBeGreaterThan(0); // Expect at least one "BookBot"
  });
  

  it('shows loading state while connecting', async () => {
    // Make connection start delay
    mockConnection.start.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
    
    // Should show loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // After connection completes, loading should disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('handles connection errors gracefully', async () => {
    // Mock connection failure
    mockConnection.start.mockRejectedValueOnce(new Error('Connection failed'));
    
    render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to connect to chat service/i)).toBeInTheDocument();
    });
  });

  it('formats messages with newlines correctly', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
    
    // Wait for connection
    await waitFor(() => {
      expect(mockConnection.on).toHaveBeenCalled();
    });
    
    // Extract the message handler
    const messageHandler = mockConnection.on.mock.calls.find(
      call => call[0] === 'ReceiveMessage'
    )[1];
    
    // Simulate receiving a message with newlines and list items
    act(() => {
      messageHandler('BookBot', 'Here are some recommendations:\n- Book 1\n- Book 2', true);
    });
    
    // Message should be formatted correctly
    expect(screen.getByText('Here are some recommendations:')).toBeInTheDocument();
    expect(screen.getByText('- Book 1')).toBeInTheDocument();
    expect(screen.getByText('- Book 2')).toBeInTheDocument();
  });

  it('stops the connection when chat is closed', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    );
    
    // Open chat
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
    
    // Wait for connection
    await waitFor(() => {
      expect(mockConnection.on).toHaveBeenCalled();
    });
    
    // Close chat
    fireEvent.click(chatButton);
    
    // Should stop connection
    await waitFor(() => {
      expect(mockConnection.stop).toHaveBeenCalled();
    });
  });
});