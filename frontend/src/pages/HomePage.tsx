import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import HomeHero from '../components/home/HomeHero';
import BookList from '../components/books/BookList';
import FeaturedCategories from '../components/home/FeaturedCategories';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, isLibrarian } = useAuth();

  return (
    <Box sx={{ backgroundColor: 'background.default', pb: 8 }}>
      {/* Hero Section */}
      <HomeHero />
      
      <Container maxWidth="lg">
        {/* Featured Books Section */}
        <Box sx={{ mb: 10 }}>
          <Box sx={{ mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography 
              variant="h6" 
              component="div" 
              color="primary"
              fontWeight="500"
              sx={{ mb: 1 }}
            >
              CURATED SELECTION
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight="bold"
              align="center"
              sx={{ mb: 1, letterSpacing: '-0.02em' }}
            >
              FEATURED BOOKS
            </Typography>
            <Box 
              sx={{ 
                width: 60, 
                height: 4, 
                backgroundColor: 'primary.main',
                mt: 2
              }} 
            />
          </Box>
          <BookList featured featuredCount={4} />
        </Box>
        
        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.08)' }} />
        
        {/* Category Showcase */}
        {/* <FeaturedCategories /> */}
        
        {isAuthenticated && !isLibrarian && (
          <>
            <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.08)' }} />
            
            {/* New Arrivals Section */}
            <Box sx={{ mb: 6 }}>
              <Box sx={{ mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography 
                  variant="h6" 
                  component="div" 
                  color="primary"
                  fontWeight="500"
                  sx={{ mb: 1 }}
                >
                  LATEST ADDITIONS
                </Typography>
                <Typography 
                  variant="h3" 
                  component="h2" 
                  fontWeight="bold"
                  align="center"
                  sx={{ mb: 1, letterSpacing: '-0.02em' }}
                >
                  NEW ARRIVALS
                </Typography>
                <Box 
                  sx={{ 
                    width: 60, 
                    height: 4, 
                    backgroundColor: 'primary.main',
                    mt: 2
                  }} 
                />
              </Box>
              <BookList featuredCount={4} />
            </Box>
          </>
        )}
        
        {/* Removed Librarian Dashboard section as requested */}
      </Container>
    </Box>
  );
};

export default HomePage;