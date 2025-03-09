import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  Fab,
  Avatar,
  Card,
  Fade,
  CircularProgress,
  Collapse
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Send as SendIcon, 
  Close as CloseIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/api';

interface Message {
  user: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Toggle chat window
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  // Auto-scroll to bottom of messages
  // useEffect(() => {
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [messages]);

  // Ensures scrollIntoView() is only called on a valid DOM element
  useEffect(() => {
    if (messagesEndRef.current instanceof HTMLElement) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  
  // Initialize connection
  useEffect(() => {
    if (isOpen && !connection) {
      setIsConnecting(true);
      
      // Get the server origin without the '/api' path
      const serverUrl = new URL(API_BASE_URL).origin;
  
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${serverUrl}/chatHub`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Custom retry strategy
            return retryContext.previousRetryCount === 0
              ? 0   // Retry immediately on first attempt
              : 1000 * (retryContext.previousRetryCount + 1); // Exponential backoff
          }
        })
        .build();
      
      const startConnection = async () => {
        try {
          await newConnection.start();
          console.log('SignalR connected');
          setConnection(newConnection);
          setIsConnecting(false);
          
          // Add welcome message
          setMessages([
            {
              user: 'BookBot',
              text: 'Hello! I can help you find books and learn about the library. Type "help" to see what I can do!',
              isBot: true,
              timestamp: new Date()
            }
          ]);
        } catch (err) {
          console.error('SignalR connection error: ', err);
          setIsConnecting(false);
          setMessages([
            {
              user: 'System',
              text: 'Failed to connect to chat service. Please try again later.',
              isBot: true,
              timestamp: new Date()
            }
          ]);
          
          // Retry connection after a delay
          setTimeout(startConnection, 5000);
        }
      };
  
      // Start initial connection
      startConnection();
      
      return () => {
        newConnection.stop()
          .then(() => console.log('SignalR connection stopped'))
          .catch(err => console.error('Error stopping connection', err));
      };
    }
  }, [isOpen, isAuthenticated]);
  
  // Set up message handler
  useEffect(() => {
    if (connection) {
      const handleReceiveMessage = (user: string, text: string, isBot: boolean) => {
        setMessages(prev => [...prev, {
          user,
          text,
          isBot,
          timestamp: new Date()
        }]);
      };
  
      connection.on('ReceiveMessage', handleReceiveMessage);
      
      // Add connection state change handlers
      connection.onclose((error) => {
        console.log('SignalR connection closed', error);
        setConnection(null);
      });
  
      return () => {
        connection.off('ReceiveMessage', handleReceiveMessage);
        
        // Optional: stop connection when unmounting or changing authentication
        connection.stop()
          .then(() => console.log('SignalR connection stopped'))
          .catch(err => console.error('Error stopping connection', err));
      };
    }
  }, [connection]);
  
  // Modify sendMessage to handle connection state
  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;

    try {
      // Ensure connection exists and is in connected state
      if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
        // Attempt to restart connection
        if (connection) {
          await connection.stop();
        }
        
        // Recreate and start connection
        const serverUrl = new URL(API_BASE_URL).origin;
        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${serverUrl}/chatHub`, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
          })
          .withAutomaticReconnect()
          .build();
        
        await newConnection.start();
        setConnection(newConnection);
      }

      // At this point, connection is guaranteed to be non-null
      const username = isAuthenticated ? user?.name : 'Guest';
      await connection!.invoke('SendMessage', username, message);
      setMessage('');
    } catch (err) {
      console.error('Error sending message: ', err);
      // Optionally show an error to the user
      setMessages(prev => [...prev, {
        user: 'System',
        text: 'Failed to send message. Please try again.',
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [connection, isAuthenticated, user, message]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const renderMessageText = useCallback((text: string) => {
    // Handle newlines and book titles
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.includes('- ') ? <Typography component="span" sx={{ display: 'block', ml: 2 }}>{line}</Typography> : line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  }, []);

  // If user is not authenticated, don't render the chat widget at all
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Chat button */}
      <Fab
        color="primary"
        onClick={toggleChat}
        aria-label="chat"
        sx={{ boxShadow: 3 }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
      
      {/* Chat window */}
      <Collapse in={isOpen} orientation="vertical">
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            bottom: 70,
            right: 0,
            width: { xs: '300px', sm: '350px' },
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}>
            <BotIcon sx={{ mr: 1 }} />
            <Typography variant="h6">BookBot Assistant</Typography>
          </Box>
          
          {/* Messages area */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            bgcolor: 'background.default'
          }}>
            {isConnecting ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              messages.map((msg, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.isBot ? 'flex-start' : 'flex-end',
                    mb: 1
                  }}
                >
                  <Fade in={true} timeout={500}>
                    <Card
                      variant="outlined"
                      sx={{
                        maxWidth: '80%',
                        p: 1.5,
                        bgcolor: msg.isBot ? 'background.paper' : 'primary.dark',
                        color: msg.isBot ? 'text.primary' : 'white',
                        borderRadius: 2,
                        boxShadow: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Avatar
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            mr: 1,
                            bgcolor: msg.isBot ? 'secondary.main' : 'primary.light'
                          }}
                        >
                          {msg.isBot ? <BotIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {msg.user}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {renderMessageText(msg.text)}
                      </Typography>
                    </Card>
                  </Fade>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input area */}
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex'
          }}>
            <TextField
              fullWidth
              placeholder="Ask me about books..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
              disabled={isConnecting || !connection}
              sx={{ mr: 1 }}
            />
            <IconButton 
              color="primary" 
              onClick={sendMessage}
              disabled={isConnecting || !connection || !message.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ChatWidget;