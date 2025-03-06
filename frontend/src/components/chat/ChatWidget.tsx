import React, { useState, useEffect, useRef } from 'react';
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
        .withAutomaticReconnect()
        .build();
      
      newConnection.start()
        .then(() => {
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
        })
        .catch(err => {
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
        });
      
      return () => {
        if (newConnection.state === signalR.HubConnectionState.Connected) {
          newConnection.stop();
        }
      };
    }
  }, [isOpen]);
  
  // Set up message handler
  useEffect(() => {
    if (connection) {
      connection.on('ReceiveMessage', (user, text, isBot) => {
        setMessages(prev => [...prev, {
          user,
          text,
          isBot,
          timestamp: new Date()
        }]);
      });
      
      return () => {
        connection.off('ReceiveMessage');
      };
    }
  }, [connection]);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = () => {
    if (message.trim() && connection) {
      const username = isAuthenticated ? user?.name : 'Guest';
      connection.invoke('SendMessage', username, message)
        .catch(err => console.error('Error sending message: ', err));
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessageText = (text: string) => {
    // Handle newlines and book titles
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.includes('- ') ? <Typography component="span" sx={{ display: 'block', ml: 2 }}>{line}</Typography> : line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

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