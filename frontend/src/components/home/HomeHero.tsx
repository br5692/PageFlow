// src/components/home/HomeHero.tsx
import React from 'react';
import { Box, Typography, Button, Container, Paper, useTheme, useMediaQuery } from '@mui/material';
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
        mb: 6,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        // Your Imgur image URL
        backgroundImage: 'url(https://i.imgur.com/pgOeIna.png)',
        borderRadius: 0,
        overflow: 'hidden',
        height: { xs: 450, md: 600 },
        display: 'flex',
        alignItems: 'center',
        maxWidth: '100%',
        boxShadow: 'none',
      }}
    >
      {/* Dark overlay to ensure text readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,.3)',
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
        }}
      />
      
      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        <Box sx={{ maxWidth: { xs: '100%', md: '50%' } }}>
          <Typography 
            variant={isMobile ? 'h4' : 'h2'} 
            component="h1" 
            fontWeight="700"
            sx={{ 
              mb: 1,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            THE PREMIUM
          </Typography>
          <Typography 
            variant={isMobile ? 'h3' : 'h1'} 
            component="div" 
            fontWeight="700"
            sx={{ 
              mb: 4,
              letterSpacing: '-0.02em',
            }}
          >
            LITERARY EXPERIENCE
          </Typography>

          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            sx={{ 
              mb: 6, 
              fontWeight: 400,
              opacity: 0.9,
              maxWidth: '90%'
            }}
          >
            Discover exceptional literature, crafted reading experiences, and a community of discerning book enthusiasts.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/register')}
                  sx={{ 
                    fontWeight: 'bold',
                    minWidth: 180,
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  GET STARTED
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/books')}
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    minWidth: 180,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  BROWSE COLLECTION
                </Button>
              </>
            ) : isCustomer ? (
              <>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/books')}
                  sx={{ 
                    fontWeight: 'bold',
                    minWidth: 180,
                  }}
                >
                  BROWSE BOOKS
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/checkouts')}
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    minWidth: 180,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  MY CHECKOUTS
                </Button>
              </>
            ) : isLibrarian ? (
              <>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/admin/books')}
                  sx={{ 
                    fontWeight: 'bold',
                    minWidth: 180,
                  }}
                >
                  MANAGE BOOKS
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/admin/checkouts')}
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    minWidth: 180,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  VIEW CHECKOUTS
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