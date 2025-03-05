import React from 'react';
import { Box, Typography, Button, Container, Paper, useTheme, useMediaQuery } from '@mui/material';
import { MenuBook } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HomeHero: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, isCustomer, isLibrarian } = useAuth();

  return (
    <Paper
      sx={{
        position: 'relative',
        color: '#fff',
        mb: 4,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: 'url(https://source.unsplash.com/featured/?library,books)',
        borderRadius: 2,
        overflow: 'hidden',
        height: { xs: 350, md: 400 },
        display: 'flex',
        alignItems: 'center',
      }}
      elevation={3}
    >
      {/* Dark overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,.7)',
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.5))',
        }}
      />
      
      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Box sx={{ maxWidth: { xs: '100%', md: '60%' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MenuBook sx={{ fontSize: 40, mr: 2 }} />
            <Typography 
              variant={isMobile ? 'h4' : 'h3'} 
              component="h1" 
              fontWeight="bold"
              sx={{ 
                textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                lineHeight: 1.2
              }}
            >
              Your Library, Reimagined
            </Typography>
          </Box>

          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            sx={{ 
              mb: 4, 
              textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
              maxWidth: '90%'
            }}
          >
            Discover new titles, manage your reading list, and join a community of book lovers with our modern library system.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/register')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/books')}
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Browse Books
                </Button>
              </>
            ) : isCustomer ? (
              <>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/books')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Browse Books
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/checkouts')}
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  My Checkouts
                </Button>
              </>
            ) : isLibrarian ? (
              <>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/admin/books')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Manage Books
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/admin/checkouts')}
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  View Checkouts
                </Button>
              </>
            ) : null}
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default HomeHero;